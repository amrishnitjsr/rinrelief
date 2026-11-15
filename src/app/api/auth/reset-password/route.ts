import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hashOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  email: z.string().trim().email().max(320),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Use a valid email, 6-digit code, and password of at least 8 characters." }, { status: 422 });
  }
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Use a valid email, 6-digit code, and password of at least 8 characters." }, { status: 422 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, role: true, adminEmailVerifiedAt: true, passwordResetCodeHash: true, passwordResetCodeExpiresAt: true },
  });
  if (!user || !["SUPER_ADMIN", "ADVOCATE"].includes(user.role) || (user.role === "ADVOCATE" && !user.adminEmailVerifiedAt) || !user.passwordResetCodeExpiresAt || user.passwordResetCodeExpiresAt < new Date() || user.passwordResetCodeHash !== hashOtp(parsed.data.code)) {
    return NextResponse.json({ error: "This verification code is invalid or expired." }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      passwordResetCodeHash: null,
      passwordResetCodeExpiresAt: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      mustChangePassword: false,
    },
  });
  return NextResponse.json({ reset: true });
}
