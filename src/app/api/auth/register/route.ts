import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{10,18}$/),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADVOCATE") {
      return NextResponse.json({ error: "Client accounts can only be created by an administrator after consultation." }, { status: 403 });
    }
    const parsed = registrationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please provide valid account details." }, { status: 422 });
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    if (existing) {
      if (existing.role !== "CLIENT" || existing.passwordHash || existing.phone !== parsed.data.phone) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      await prisma.user.update({ where: { id: existing.id }, data: { name: parsed.data.name, passwordHash } });
      return NextResponse.json({ created: true }, { status: 201 });
    }
    const { password: _password, ...profile } = parsed.data;
    await prisma.user.create({ data: { ...profile, email, passwordHash, role: "CLIENT" } });
    return NextResponse.json({ created: true }, { status: 201 });
  } catch (error) {
    console.error("registration failed", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json({ error: "Account service is not configured. Please contact support." }, { status: 503 });
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ error: "Account service is temporarily unavailable. Please try again shortly." }, { status: 503 });
    }
    return NextResponse.json({ error: "Unable to create your account right now. Please try again." }, { status: 500 });
  }
}
