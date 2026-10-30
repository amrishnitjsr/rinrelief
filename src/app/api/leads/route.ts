import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLeadSchema } from "@/lib/validation";

function createReference() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LEAD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const data = createLeadSchema.parse(await request.json());
    const lead = await prisma.$transaction(async (transaction) => {
      const createdLead = await transaction.lead.create({
        data: { ...data, email: data.email.toLowerCase(), referenceNo: createReference() },
        select: { id: true, referenceNo: true, status: true },
      });
      await transaction.auditLog.create({
        data: {
          action: "LEAD_CREATED",
          entityType: "Lead",
          entityId: createdLead.id,
          metadata: { referenceNo: createdLead.referenceNo, source: "public_chatbot" },
        },
      });
      return createdLead;
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    if (error instanceof Error && error.name === "ZodError") return NextResponse.json({ error: "Please check the submitted details" }, { status: 422 });
    console.error("lead creation failed", error);
    return NextResponse.json({ error: "Unable to submit your inquiry" }, { status: 500 });
  }
}
