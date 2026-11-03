import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const admin = await prisma.$transaction(async (transaction) => {
      const created = await transaction.user.create({
        data: {
          name: parsed.data.name,
          email,
          phone: parsed.data.phone,
          passwordHash,
          role: "ADVOCATE",
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

    return NextResponse.json({ created: admin }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("super admin creation failed", error);
    return NextResponse.json({ error: "Unable to create the admin account right now." }, { status: 500 });
  }
}
