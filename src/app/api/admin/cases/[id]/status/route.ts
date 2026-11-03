import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateCache } from "@/lib/redis";
import { ADMIN_CASE_QUEUE_CACHE_KEY } from "@/lib/cache-keys";

const statusSchema = z.object({
  status: z.enum(["INQUIRY_RECEIVED", "CONSULTATION_PAID", "LEGAL_NOTICE_SENT", "UNDER_NEGOTIATION", "SETTLEMENT_REACHED", "CLOSED"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    const actor = actorId ? await prisma.user.findUnique({ where: { id: actorId }, select: { role: true } }) : null;
    if (!actorId || !actor || !["ADVOCATE", "SUPER_ADMIN"].includes(actor.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = statusSchema.safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error: "Invalid case status" }, { status: 422 });

    const item = await prisma.debtCase.findFirst({ where: { OR: [{ id }, { caseNumber: id }] }, select: { id: true, caseNumber: true } });
    if (!item) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    const updated = await prisma.$transaction(async (transaction) => {
      const result = await transaction.debtCase.update({ where: { id: item.id }, data: { status: body.data.status }, select: { id: true, caseNumber: true, status: true, updatedAt: true } });
      await transaction.auditLog.create({ data: { actorId, action: "CASE_STATUS_UPDATED", entityType: "DebtCase", entityId: item.id, metadata: { status: body.data.status } } });
      return result;
    });
    await invalidateCache(ADMIN_CASE_QUEUE_CACHE_KEY);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    console.error("case status update failed", error);
    return NextResponse.json({ error: "Unable to update case status" }, { status: 500 });
  }
}
