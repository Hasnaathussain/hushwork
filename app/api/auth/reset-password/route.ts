import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { consumePasswordResetToken } from "@/lib/db";
import { assertSameOrigin, checkRateLimit, requestKey } from "@/lib/security";
import { resetPasswordSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!checkRateLimit(requestKey(request, "reset-password"), 6, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    const body = resetPasswordSchema.parse(await request.json());
    const updated = await consumePasswordResetToken(body.token, await bcrypt.hash(body.password, 12));
    return updated ? NextResponse.json({ message: "Password updated. You can sign in now." }) : NextResponse.json({ error: "That reset link is invalid or expired." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "That reset link is invalid or expired." }, { status: 400 });
  }
}
