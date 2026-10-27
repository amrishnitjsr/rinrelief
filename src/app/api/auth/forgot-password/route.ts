import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env.mjs";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({ email: z.string().trim().email().max(320) });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  const response = NextResponse.json({
    message: "If an account exists for that email, we sent a password reset link.",
  });
  if (!parsed.success) return response;

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) return response;

  const token = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash,
      resetTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  const resetUrl = `${env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail({ email, resetUrl });
  return response;
}
