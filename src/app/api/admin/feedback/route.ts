import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().cuid(),
  approved: z.boolean(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !["ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, name: true, city: true, rating: true, message: true, approved: true, isDemo: true, createdAt: true },
  });
  return NextResponse.json(feedback);
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const data = updateSchema.parse(await request.json());
    const feedback = await prisma.feedback.update({
      where: { id: data.id },
      data: { approved: data.approved },
      select: { id: true, approved: true },
    });
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: data.approved ? "FEEDBACK_APPROVED" : "FEEDBACK_REJECTED",
        entityType: "Feedback",
        entityId: feedback.id,
        metadata: { approved: data.approved },
      },
    });
    return NextResponse.json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid feedback moderation request" }, { status: 422 });
    console.error("feedback moderation failed", error);
    return NextResponse.json({ error: "Unable to update feedback" }, { status: 500 });
  }
}
