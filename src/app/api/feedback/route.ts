import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const feedbackSchema = z.object({
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().trim().min(10).max(1_000),
});

const negativeTerms = ["bad", "worst", "fraud", "scam", "cheat", "cheated", "fake", "harass", "harassment", "rude", "poor", "terrible", "awful", "useless", "disappointed", "disappointing", "never", "not helpful", "धोखा", "खराब", "परेशान"];

function shouldAutoApprove(rating: number, message: string) {
  const normalized = message.toLowerCase();
  return rating >= 4 && !negativeTerms.some((term) => normalized.includes(term));
}

export async function GET() {
  const feedback = await prisma.feedback.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, city: true, rating: true, message: true, isDemo: true, approved: true },
  });
  return NextResponse.json(feedback);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Please sign in as a client to submit feedback." }, { status: 401 });
    }
    const body = await request.json() as Record<string, unknown>;
    const data = feedbackSchema.parse({
      ...body,
      name: body.name ?? session.user.name ?? "Client",
    });
    const approved = shouldAutoApprove(data.rating, data.message);
    const feedback = await prisma.feedback.create({
      data: { ...data, approved, clientId: session.user.id },
      select: { id: true },
    });
    return NextResponse.json({
      id: feedback.id,
      approved,
      message: approved ? "Thank you. Your feedback is now visible on the page." : "Thank you. Your feedback is awaiting admin review.",
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check your feedback details." }, { status: 422 });
    console.error("feedback creation failed", error);
    return NextResponse.json({ error: "Unable to submit feedback." }, { status: 500 });
  }
}
