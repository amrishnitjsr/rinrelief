import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const feedbackSchema = z.object({
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().trim().min(10).max(1_000),
});

export async function GET() {
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, city: true, rating: true, message: true, isDemo: true, approved: true },
  });
  return NextResponse.json(feedback);
}

export async function POST(request: Request) {
  try {
    const data = feedbackSchema.parse(await request.json());
    const feedback = await prisma.feedback.create({
      data,
      select: { id: true },
    });
    return NextResponse.json({ id: feedback.id, message: "Thank you. Your feedback is awaiting review." }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check your feedback details." }, { status: 422 });
    console.error("feedback creation failed", error);
    return NextResponse.json({ error: "Unable to submit feedback." }, { status: 500 });
  }
}
