import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/payments";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json() as { caseId?: string; razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string };
  if (!body.caseId || !body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  const debtCase = await prisma.debtCase.findUnique({ where: { id: body.caseId } });
  if (!debtCase || (session.user.role === "CLIENT" && debtCase.clientEmail.toLowerCase() !== session.user.email?.toLowerCase())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!verifyRazorpaySignature(body.razorpayOrderId, body.razorpayPaymentId, body.razorpaySignature)) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  await prisma.$transaction([
    prisma.paymentTransaction.update({ where: { caseId: body.caseId }, data: { razorpayPaymentId: body.razorpayPaymentId, razorpaySignature: body.razorpaySignature, status: "CAPTURED" } }),
    prisma.debtCase.update({ where: { id: body.caseId }, data: { status: "CONSULTATION_PAID" } }),
  ]);
  return NextResponse.json({ verified: true });
}
