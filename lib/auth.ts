import "server-only";

import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { findUserBySessionToken, revokeSession, storeSession, type User } from "@/lib/db";

const SESSION_COOKIE = "hushwork_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS
};

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? findUserBySessionToken(token) : null;
}

export async function startSession(userId: string): Promise<void> {
  const token = await createSessionToken(userId);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions);
}

export async function createSessionToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await storeSession({ token, userId, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 });
  return token;
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const value = request.headers.get("authorization");
  if (!value?.toLowerCase().startsWith("bearer ")) return getCurrentUser();
  const token = value.slice(7).trim();
  return token ? findUserBySessionToken(token) : null;
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(token);
  jar.delete(SESSION_COOKIE);
}
