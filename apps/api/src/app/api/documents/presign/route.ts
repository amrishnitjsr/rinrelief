import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUploadUrl } from "@/lib/storage";
import { createDocumentSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = createDocumentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid document metadata" }, { status: 422 });
  const { caseId, fileName, fileMimeType, fileSize, category } = parsed.data;
  const debtCase = await prisma.debtCase.findUnique({ where: { id: caseId } });
  if (!debtCase) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (session.user.role === "CLIENT" && debtCase.clientEmail.toLowerCase() !== session.user.email?.toLowerCase()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const storageKey = `cases/${caseId}/${crypto.randomUUID()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploadUrl = await createUploadUrl(storageKey, fileMimeType);
  const document = await prisma.caseDocument.create({ data: { caseId, category, fileName, fileMimeType, fileSize, storageKey } });
  return NextResponse.json({ documentId: document.id, storageKey, uploadUrl }, { status: 201 });
}
