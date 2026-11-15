import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hashOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter the 6-digit verification code." }, { status: 422 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.role !== "ADVOCATE" || user.adminEmailVerifiedAt || user.adminEmailVerificationExpiresAt! < new Date() || user.adminEmailVerificationCodeHash !== hashOtp(parsed.data.code)) {
    return NextResponse.json({ error: "That verification code is invalid or expired." }, { status: 422 });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { adminEmailVerifiedAt: new Date(), adminEmailVerificationCodeHash: null, adminEmailVerificationExpiresAt: null },
  });
  return NextResponse.json({ verified: true });
}
