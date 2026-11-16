import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtp } from "@/lib/otp";
import { sendVerificationCodeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({ email: z.string().trim().email().max(320) });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true, adminEmailVerifiedAt: true } });
  if (!user || !["SUPER_ADMIN", "ADVOCATE"].includes(user.role) || (user.role === "ADVOCATE" && !user.adminEmailVerifiedAt)) {
    return NextResponse.json(
      { error: "This account is not registered for admin access. Please register first, then try password recovery." },
      { status: 404 },
    );
  }
  const verification = createOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetCodeHash: verification.hash,
      passwordResetCodeExpiresAt: verification.expiresAt,
    },
  });
  try {
    await sendVerificationCodeEmail({ email: user.email, code: verification.code, purpose: "password" });
  } catch (error) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetCodeHash: null, passwordResetCodeExpiresAt: null },
    });
    console.error("password reset email failed", error);
    return NextResponse.json({ error: "We could not send the verification code. Please try again shortly." }, { status: 502 });
  }
  return NextResponse.json({ message: "Verification code sent. Please check your email inbox and spam folder." });
}
