import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/payments";

export async function POST(request: Request) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Payment webhooks are disabled" }, { status: 503 });
  }
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !verifyWebhookSignature(rawBody, signature)) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  const event = JSON.parse(rawBody) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  const payment = event.payload?.payment?.entity;
  if (payment?.order_id && payment.id && event.event === "payment.captured") {
    await prisma.paymentTransaction.updateMany({ where: { razorpayOrderId: payment.order_id }, data: { razorpayPaymentId: payment.id, status: "CAPTURED" } });
    await prisma.debtCase.updateMany({ where: { payment: { razorpayOrderId: payment.order_id } }, data: { status: "CONSULTATION_PAID" } });
  }
  return NextResponse.json({ received: true });
}
