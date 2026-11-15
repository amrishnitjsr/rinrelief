import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUploadUrl } from "@/lib/storage";
import { createDocumentSchema } from "@/lib/validation";
import { invalidateCache } from "@/lib/redis";
import { ADMIN_CASE_QUEUE_CACHE_KEY } from "@/lib/cache-keys";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = createDocumentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid document metadata" }, { status: 422 });
  const { caseId, fileName, fileMimeType, fileSize, category, title, referenceNo, isClientVisible } = parsed.data;
  const debtCase = await prisma.debtCase.findUnique({ where: { id: caseId } });
  if (!debtCase) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (session.user.role === "CLIENT" && debtCase.clientEmail.toLowerCase() !== session.user.email?.toLowerCase()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["CLIENT", "ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const storageKey = `cases/${caseId}/${crypto.randomUUID()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploadUrl = await createUploadUrl(storageKey, fileMimeType);
  const document = await prisma.caseDocument.create({ data: { caseId, category, fileName, fileMimeType, fileSize, storageKey, title, referenceNo, isClientVisible } });
  await invalidateCache(ADMIN_CASE_QUEUE_CACHE_KEY);
  if (session.user.role !== "CLIENT") {
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DOCUMENT_UPLOADED",
        entityType: "CaseDocument",
        entityId: document.id,
        metadata: { caseId, fileName, category, fileSize },
      },
    });
  }
  return NextResponse.json({ documentId: document.id, storageKey, uploadUrl }, { status: 201 });
}
