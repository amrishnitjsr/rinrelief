import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hashOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const schema = z.object({ code: z.string().regex(/^\d{6}$/), newPassword: z.string().min(8).max(128) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.role || !["SUPER_ADMIN", "ADVOCATE"].includes(session.user.role)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a 6-digit code and password of at least 8 characters." }, { status: 422 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordChangeCodeExpiresAt || user.passwordChangeCodeExpiresAt < new Date() || user.passwordChangeCodeHash !== hashOtp(parsed.data.code)) {
    return NextResponse.json({ error: "That verification code is invalid or expired." }, { status: 422 });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12), passwordChangeCodeHash: null, passwordChangeCodeExpiresAt: null, mustChangePassword: false },
  });
  return NextResponse.json({ updated: true });
}
