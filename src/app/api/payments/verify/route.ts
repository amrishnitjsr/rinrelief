import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPaymentAccessToken, verifyRazorpaySignature } from "@/lib/payments";

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json() as { caseId?: string; razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string; paymentAccessToken?: string };
  if (!body.caseId || !body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  const debtCase = await prisma.debtCase.findUnique({ where: { id: body.caseId }, include: { payment: true } });
  const hasPaymentAccessToken = verifyPaymentAccessToken(body.paymentAccessToken ?? null, body.caseId);
  const ownsCase =
    debtCase &&
    (hasPaymentAccessToken ||
      (!!session?.user &&
        (session.user.role !== "CLIENT" ||
          debtCase.clientEmail.toLowerCase() === session.user.email?.toLowerCase() ||
          (!!session.user.phone && debtCase.clientPhone === session.user.phone))));
  if (!ownsCase) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (debtCase.payment?.razorpayOrderId !== body.razorpayOrderId) return NextResponse.json({ error: "Payment order does not match this case" }, { status: 400 });
  if (!verifyRazorpaySignature(body.razorpayOrderId, body.razorpayPaymentId, body.razorpaySignature)) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  await prisma.$transaction([
    prisma.paymentTransaction.update({ where: { caseId: body.caseId }, data: { razorpayPaymentId: body.razorpayPaymentId, razorpaySignature: body.razorpaySignature, status: "CAPTURED" } }),
    prisma.debtCase.update({ where: { id: body.caseId }, data: { status: "CONSULTATION_PAID" } }),
  ]);
  return NextResponse.json({ verified: true });
}
