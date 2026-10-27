import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const parsed = resetSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Use a valid token and a password of at least 8 characters." }, { status: 422 });
  }

  const resetTokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash,
      resetTokenExpiresAt: { gt: new Date() },
    },
  });
  if (!user) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });
  return NextResponse.json({ reset: true });
}
