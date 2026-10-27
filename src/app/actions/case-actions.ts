"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCaseSchema } from "@/lib/validation";
import { notifyAdminOfNewCase } from "@/lib/email";
import { createPaymentAccessToken, CURRENT_PAYMENT_AMOUNT } from "@/lib/payments";

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
