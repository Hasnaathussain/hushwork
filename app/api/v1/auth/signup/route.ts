import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";
import { checkRateLimit, requestKey } from "@/lib/security";
import { signupSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(requestKey(request, "mobile-signup"), 8, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    const body = signupSchema.parse(await request.json());
    if (await findUserByEmail(body.email)) return NextResponse.json({ error: "Could not create that account." }, { status: 409 });
    const user = await createUser({ name: body.name, email: body.email, passwordHash: await bcrypt.hash(body.password, 12) });
    return NextResponse.json({ token: await createSessionToken(user.id), user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create that account." }, { status: 400 });
  }
}
