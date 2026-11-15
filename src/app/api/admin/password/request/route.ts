import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOtp } from "@/lib/otp";
import { sendVerificationCodeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN" || !session.user.email) return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
  const verification = createOtp();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordChangeCodeHash: verification.hash, passwordChangeCodeExpiresAt: verification.expiresAt },
  });
  await sendVerificationCodeEmail({ email: session.user.email, code: verification.code, purpose: "password" });
  return NextResponse.json({ sent: true });
}
