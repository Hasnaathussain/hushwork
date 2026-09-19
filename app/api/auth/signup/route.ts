import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { assertSameOrigin, checkRateLimit, requestKey } from "@/lib/security";
import { signupSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!checkRateLimit(requestKey(request, "signup"), 8, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    const body = signupSchema.parse(await request.json());
    if (findUserByEmail(body.email)) return NextResponse.json({ error: "Could not create that account." }, { status: 409 });
    const user = createUser({ name: body.name, email: body.email, passwordHash: await bcrypt.hash(body.password, 12) });
    await startSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    return NextResponse.json({ error: "Could not create that account." }, { status: 400 });
  }
}
