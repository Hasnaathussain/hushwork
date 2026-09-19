import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";
import { findUserByEmail } from "@/lib/db";
import { checkRateLimit, requestKey } from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(requestKey(request, "mobile-login"), 12, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    const body = loginSchema.parse(await request.json());
    const user = await findUserByEmail(body.email);
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return NextResponse.json({ error: "Email or password is not right." }, { status: 401 });
    return NextResponse.json({ token: await createSessionToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ error: "Could not sign you in." }, { status: 400 });
  }
}
