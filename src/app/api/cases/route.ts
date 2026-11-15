import { NextResponse } from "next/server";
import { createDebtCase } from "@/app/actions/case-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || !["ADVOCATE", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Advocate access required" }, { status: 403 });
  }
  const status = new URL(request.url).searchParams.get("status");
  const cases = await prisma.debtCase.findMany({
    where: status ? { status: status as "INQUIRY_RECEIVED" | "CONSULTATION_PAID" | "LEGAL_NOTICE_SENT" | "UNDER_NEGOTIATION" | "SETTLEMENT_REACHED" | "CLOSED" } : undefined,
    orderBy: { createdAt: "desc" },
    include: { payment: true, assignedAdvocate: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(cases);
}

export async function POST(request: Request) {
  try {
    const result = await createDebtCase(await request.json());
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    if (error instanceof Error && error.name === "ZodError") return NextResponse.json({ error: "Invalid case details" }, { status: 422 });
    console.error("case creation failed", error);
    return NextResponse.json({ error: "Unable to create case" }, { status: 500 });
  }
}
