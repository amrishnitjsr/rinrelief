"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCaseSchema } from "@/lib/validation";
import { notifyAdminOfNewCase } from "@/lib/email";
import { createPaymentAccessToken, CURRENT_PAYMENT_AMOUNT } from "@/lib/payments";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { decryptCredential, encryptCredential } from "@/lib/credential-vault";

function createCaseNumber() {
  const now = new Date();
  const datePart = now.toISOString().replace(/\D/g, "").slice(0, 17);
  return datePart;
}

export async function createDebtCase(input: unknown) {
  const data = createCaseSchema.parse(input);
  const session = await auth();
  const existingClient = session?.user?.role === "CLIENT" ? session.user.id : undefined;
  const client = existingClient
    ? await prisma.user.findUnique({ where: { id: existingClient } })
    : await prisma.user.findUnique({ where: { email: data.clientEmail.toLowerCase() } });

  const user = client ?? await prisma.user.create({
    data: { name: data.clientName, email: data.clientEmail.toLowerCase(), phone: data.clientPhone, role: "CLIENT" },
  });
  const debtCase = await prisma.debtCase.create({
    data: {
      ...data,
      caseNumber: createCaseNumber(),
      feeAmount: CURRENT_PAYMENT_AMOUNT,
      clientEmail: user.email.toLowerCase(),
      clientName: existingClient ? user.name : data.clientName,
      clientPhone: existingClient ? user.phone : data.clientPhone,
    },
  });
  try {
    await notifyAdminOfNewCase({ id: debtCase.caseNumber ?? debtCase.id, clientName: debtCase.clientName, lender: debtCase.bankOrLenderName, phone: debtCase.clientPhone });
  } catch (error) {
    console.error("case notification failed", { caseId: debtCase.id, error });
  }
  revalidatePath("/admin/cases");
  return {
    id: debtCase.id,
    caseNumber: debtCase.caseNumber ?? debtCase.id,
    paymentAccessToken: createPaymentAccessToken(debtCase.id),
    status: debtCase.status,
  };
}

export async function addCaseNote(input: { caseId: string; content: string; isInternalOnly: boolean }) {
  const session = await auth();
  if (!session?.user?.id || !["ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) throw new Error("Advocate access required");
  if (!input.content.trim()) throw new Error("Note content is required");
  const note = await prisma.caseNote.create({
    data: { caseId: input.caseId, authorId: session.user.id, content: input.content.trim(), isInternalOnly: input.isInternalOnly },
  });
  revalidatePath(`/admin/cases/${input.caseId}`);
  return note;
}

export async function updateCaseStatus(caseId: string, status: "INQUIRY_RECEIVED" | "CONSULTATION_PAID" | "LEGAL_NOTICE_SENT" | "UNDER_NEGOTIATION" | "SETTLEMENT_REACHED" | "CLOSED") {
  const session = await auth();
  if (!session?.user?.id || !["ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) throw new Error("Advocate access required");
  const updated = await prisma.debtCase.update({ where: { id: caseId }, data: { status } });
  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath("/admin/cases");
  return updated;
}

const convertLeadSchema = z.object({
  leadId: z.string().cuid(),
  bankOrLenderName: z.string().trim().min(2),
  loanType: z.enum(["CREDIT_CARD", "PERSONAL_LOAN", "APP_LOAN_INSTANT", "BUSINESS_LOAN", "HOME_OR_AUTO_LOAN"]),
  totalOutstanding: z.coerce.number().positive(),
  feeAmount: z.coerce.number().nonnegative(),
  installmentAmount: z.coerce.number().positive().optional(),
  installmentDueDate: z.coerce.date().optional(),
});

function generatedCaseNumber() {
  return `CASE-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function generatedClientPassword() {
  return `Rin@${Math.random().toString(36).slice(2, 8)}!`;
}

export async function convertLeadToCase(input: unknown) {
  const session = await auth();
  if (!session?.user?.id || !["ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) throw new Error("Admin access required");
  const data = convertLeadSchema.parse(input);
  const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
  if (!lead) throw new Error("Lead not found");
  if (lead.convertedCaseId) throw new Error("This lead already has a case");
  const existingUser = await prisma.user.findUnique({ where: { email: lead.email.toLowerCase() }, select: { role: true } });
  if (existingUser && existingUser.role !== "CLIENT") throw new Error("This email belongs to an administrator account");

  const password = generatedClientPassword();
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.upsert({
      where: { email: lead.email.toLowerCase() },
      update: { name: lead.name, phone: lead.phone, role: "CLIENT", passwordHash, mustChangePassword: true, temporaryPasswordCiphertext: encryptCredential(password), temporaryPasswordIssuedAt: new Date() },
      create: { name: lead.name, email: lead.email.toLowerCase(), phone: lead.phone, role: "CLIENT", passwordHash, mustChangePassword: true, temporaryPasswordCiphertext: encryptCredential(password), temporaryPasswordIssuedAt: new Date() },
    });
    const debtCase = await transaction.debtCase.create({
      data: {
        caseNumber: generatedCaseNumber(),
        clientName: lead.name,
        clientEmail: lead.email.toLowerCase(),
        clientPhone: lead.phone,
        city: lead.city,
        bankOrLenderName: data.bankOrLenderName,
        loanType: data.loanType,
        totalOutstanding: data.totalOutstanding,
        overdueDurationDays: 0,
        feeAmount: data.feeAmount,
        assignedAdvocateId: session.user.id,
      },
    });
    await transaction.invoice.create({
      data: {
        clientId: user.id,
        caseId: debtCase.id,
        feeModel: data.installmentAmount ? "INSTALLMENT" : "FLAT",
        totalFee: data.feeAmount,
        installments: data.installmentAmount && data.installmentDueDate ? {
          create: { amount: data.installmentAmount, dueDate: data.installmentDueDate },
        } : undefined,
      },
    });
    await transaction.lead.update({ where: { id: lead.id }, data: { status: "CONVERTED", convertedCaseId: debtCase.id, assignedToId: session.user.id } });
    await transaction.auditLog.create({ data: { actorId: session.user.id, action: "LEAD_CONVERTED", entityType: "DebtCase", entityId: debtCase.id, metadata: { leadId: lead.id } } });
    return debtCase;
  }, { maxWait: 10_000, timeout: 20_000 });
  revalidatePath("/admin/leads");
  revalidatePath("/admin/cases");
  return { caseId: result.id, caseNumber: result.caseNumber ?? result.id, clientEmail: lead.email, temporaryPassword: password };
}

const operationsSchema = z.object({
  caseId: z.string().cuid(),
  status: z.enum(["INQUIRY_RECEIVED", "CONSULTATION_PAID", "LEGAL_NOTICE_SENT", "UNDER_NEGOTIATION", "SETTLEMENT_REACHED", "CLOSED"]),
  feeAmount: z.coerce.number().nonnegative(),
  totalPaid: z.coerce.number().nonnegative(),
  clientUpdate: z.string().trim().max(5000).optional(),
});

export async function updateCaseOperations(input: unknown) {
  const session = await auth();
  if (!session?.user?.id || !["ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) throw new Error("Admin access required");
  const data = operationsSchema.parse(input);
  const item = await prisma.debtCase.findUnique({ where: { id: data.caseId }, include: { invoices: { take: 1 } } });
  if (!item) throw new Error("Case not found");
  await prisma.$transaction(async (transaction) => {
    await transaction.debtCase.update({ where: { id: item.id }, data: { status: data.status, feeAmount: data.feeAmount } });
    const invoice = item.invoices[0] ?? await transaction.invoice.create({ data: { clientId: (await transaction.user.findUniqueOrThrow({ where: { email: item.clientEmail } })).id, caseId: item.id, totalFee: data.feeAmount } });
    await transaction.invoice.update({ where: { id: invoice.id }, data: { totalFee: data.feeAmount, totalPaid: data.totalPaid } });
    if (data.clientUpdate) await transaction.caseNote.create({ data: { caseId: item.id, authorId: session.user.id, content: data.clientUpdate, isInternalOnly: false } });
    await transaction.auditLog.create({ data: { actorId: session.user.id, action: "CASE_UPDATED", entityType: "DebtCase", entityId: item.id, metadata: { status: data.status, feeAmount: data.feeAmount, totalPaid: data.totalPaid } } });
  }, { maxWait: 10_000, timeout: 20_000 });
  revalidatePath(`/admin/cases/${item.caseNumber ?? item.id}`);
  revalidatePath("/dashboard");
}

export async function regenerateClientPassword(caseId: string) {
  const session = await auth();
  if (!session?.user?.id || !["ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) throw new Error("Admin access required");
  const item = await prisma.debtCase.findUnique({ where: { id: caseId }, select: { clientEmail: true, caseNumber: true } });
  if (!item) throw new Error("Case not found");
  const password = generatedClientPassword();
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { email: item.clientEmail.toLowerCase() }, data: { passwordHash, mustChangePassword: true, temporaryPasswordCiphertext: encryptCredential(password), temporaryPasswordIssuedAt: new Date() } }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CLIENT_PASSWORD_REGENERATED",
        entityType: "DebtCase",
        entityId: caseId,
        metadata: { caseNumber: item.caseNumber },
      },
    }),
  ]);
  return { caseNumber: item.caseNumber ?? caseId, email: item.clientEmail, temporaryPassword: password };
}

export async function getClientCredential(caseId: string) {
  const session = await auth();
  if (!session?.user?.id || !["ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) throw new Error("Admin access required");
  const item = await prisma.debtCase.findUnique({
    where: { id: caseId },
    select: { caseNumber: true, clientEmail: true, assignedAdvocateId: true },
  });
  if (!item) throw new Error("Case not found");
  const user = await prisma.user.findUnique({ where: { email: item.clientEmail.toLowerCase() }, select: { temporaryPasswordCiphertext: true } });
  return {
    caseNumber: item.caseNumber ?? caseId,
    email: item.clientEmail,
    temporaryPassword: user?.temporaryPasswordCiphertext ? decryptCredential(user.temporaryPasswordCiphertext) : null,
  };
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(128),
});

export async function changeClientPassword(input: unknown) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CLIENT") throw new Error("Client access required");
  const data = changePasswordSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!user?.passwordHash || !(await bcrypt.compare(data.currentPassword, user.passwordHash))) throw new Error("Current temporary password is incorrect");
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await bcrypt.hash(data.newPassword, 12), mustChangePassword: false, temporaryPasswordCiphertext: null, temporaryPasswordIssuedAt: null },
  });
  return { success: true };
}
