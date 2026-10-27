import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ service: "rinrelife-api", status: "ok" });
}
