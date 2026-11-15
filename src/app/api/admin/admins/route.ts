import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/otp";
import { sendVerificationCodeEmail } from "@/lib/email";

const adminSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{10,18}$/),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    const actor = actorId
      ? await prisma.user.findUnique({ where: { id: actorId }, select: { role: true } })
      : null;

    if (!actorId || actor?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const parsed = adminSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide a valid name, email, phone, and password." }, { status: 422 });
    }

    const email = parsed.data.email.toLowerCase();
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const verification = createOtp();
    const admin = await prisma.$transaction(async (transaction) => {
      const created = await transaction.user.create({
        data: {
          name: parsed.data.name,
          email,
          phone: parsed.data.phone,
          passwordHash,
          role: "ADVOCATE",
          adminEmailVerificationCodeHash: verification.hash,
          adminEmailVerificationExpiresAt: verification.expiresAt,
        },
        select: { id: true, name: true, email: true },
      });

      await transaction.auditLog.create({
        data: {
          actorId,
          action: "ADMIN_CREATED",
          entityType: "User",
          entityId: created.id,
          metadata: { email: created.email },
        },
      });

      return created;
    });
    try {
      await sendVerificationCodeEmail({ email: admin.email, code: verification.code, purpose: "admin" });
    } catch (emailError) {
      await prisma.$transaction([
        prisma.auditLog.deleteMany({ where: { entityType: "User", entityId: admin.id, action: "ADMIN_CREATED" } }),
        prisma.user.delete({ where: { id: admin.id } }),
      ]);
      throw emailError;
    }

    return NextResponse.json({ created: admin, verificationRequired: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    if (error instanceof Error && error.message.startsWith("Verification email failed:")) {
      return NextResponse.json({ error: "Admin was not created because the verification email could not be sent. Check RESEND_API_KEY and try again." }, { status: 502 });
    }
    console.error("super admin creation failed", error);
    return NextResponse.json({ error: "Unable to create the admin account right now." }, { status: 500 });
  }
}
