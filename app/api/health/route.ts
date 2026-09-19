import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export function GET() {
  try {
    getDb().prepare("SELECT 1").get();
    return NextResponse.json({ ok: true, service: "hushwork", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
