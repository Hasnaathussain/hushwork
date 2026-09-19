import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await endSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not sign out." }, { status: 400 });
  }
}
