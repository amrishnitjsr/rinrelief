import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/payments";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  const debtCase = await prisma.debtCase.findUnique({ where: { id }, include: { payment: true } });
  if (!debtCase) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (session.user.role === "CLIENT" && session.user.email?.toLowerCase() !== debtCase.clientEmail.toLowerCase()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (debtCase.payment?.status === "CAPTURED") return NextResponse.json({ error: "Payment already captured" }, { status: 409 });
  const existing = debtCase.payment?.razorpayOrderId;
  const order = existing ? { id: existing } : await createRazorpayOrder(debtCase.feeAmount, `case_${debtCase.id}`);
  await prisma.paymentTransaction.upsert({
    where: { caseId: debtCase.id },
    create: { caseId: debtCase.id, razorpayOrderId: order.id, amount: debtCase.feeAmount },
    update: { razorpayOrderId: order.id, amount: debtCase.feeAmount, status: "PENDING" },
  });
  return NextResponse.json({ orderId: order.id, amount: debtCase.feeAmount, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID });
}
