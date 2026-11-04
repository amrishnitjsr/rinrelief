import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2_000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Client access required" }, { status: 403 });
  }
  try {
    const data = querySchema.parse(await request.json());
    const query = await prisma.clientQuery.create({
      data: { ...data, clientId: session.user.id },
      select: { id: true, subject: true, status: true, createdAt: true },
    });
    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please add a subject and a detailed message." }, { status: 422 });
    console.error("client query creation failed", error);
    return NextResponse.json({ error: "Unable to raise your query." }, { status: 500 });
  }
}
