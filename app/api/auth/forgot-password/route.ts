import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { assertSameOrigin, checkRateLimit, requestKey } from "@/lib/security";
import { forgotPasswordSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!checkRateLimit(requestKey(request, "forgot-password"), 4, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    const { email } = forgotPasswordSchema.parse(await request.json());
    const reset = await createPasswordResetToken(email);
    if (reset) await sendPasswordResetEmail(reset);
    return NextResponse.json({ message: "If an account exists for that email, a reset link is on its way." });
  } catch {
    return NextResponse.json({ error: "We could not process that request." }, { status: 400 });
  }
}
