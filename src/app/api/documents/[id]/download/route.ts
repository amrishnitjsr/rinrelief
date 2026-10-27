import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  const document = await prisma.caseDocument.findUnique({ where: { id }, include: { debtCase: true } });
  if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  if (session.user.role === "CLIENT" && document.debtCase.clientEmail.toLowerCase() !== session.user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ downloadUrl: await createDownloadUrl(document.storageKey), fileName: document.fileName });
}
