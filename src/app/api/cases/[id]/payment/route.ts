import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, CURRENT_PAYMENT_AMOUNT } from "@/lib/payments";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await params;
    const debtCase = await prisma.debtCase.findUnique({ where: { id }, include: { payment: true } });
    if (!debtCase) return NextResponse.json({ error: "Case not found" }, { status: 404 });
    const ownsCase =
      session.user.role !== "CLIENT" ||
      session.user.email?.toLowerCase() === debtCase.clientEmail.toLowerCase() ||
      (!!session.user.phone && debtCase.clientPhone === session.user.phone);
    if (!ownsCase) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (debtCase.payment?.status === "CAPTURED") return NextResponse.json({ error: "Payment already captured" }, { status: 409 });
    const existing = debtCase.payment?.amount === CURRENT_PAYMENT_AMOUNT ? debtCase.payment.razorpayOrderId : undefined;
    const order = existing ? { id: existing } : await createRazorpayOrder(CURRENT_PAYMENT_AMOUNT, `case_${debtCase.id}`);
    await prisma.paymentTransaction.upsert({
      where: { caseId: debtCase.id },
      create: { caseId: debtCase.id, razorpayOrderId: order.id, amount: CURRENT_PAYMENT_AMOUNT },
      update: { razorpayOrderId: order.id, amount: CURRENT_PAYMENT_AMOUNT, status: "PENDING" },
    });
    return NextResponse.json({ orderId: order.id, amount: CURRENT_PAYMENT_AMOUNT, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("payment order creation failed", error);
    return NextResponse.json({ error: "Payment gateway is unavailable. Check the Razorpay test credentials." }, { status: 502 });
  }
}
