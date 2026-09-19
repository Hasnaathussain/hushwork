import { NextResponse } from "next/server";
import { answerAssistant } from "@/lib/assistant";
import { assertSameOrigin, checkRateLimit, requestKey } from "@/lib/security";
import { assistantSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!checkRateLimit(requestKey(request, "assistant"), 18, 60_000)) {
      return NextResponse.json({ error: "The guide needs a short breather. Try again in a minute." }, { status: 429 });
    }
    const body = assistantSchema.parse(await request.json());
    return NextResponse.json(await answerAssistant(body.message));
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    return NextResponse.json({ error: "The guide could not answer that just now." }, { status: 400 });
  }
}
