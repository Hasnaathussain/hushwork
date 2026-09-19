import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Sign in to view orders." }, { status: 401 });
  return NextResponse.json({ orders: await getOrdersForUser(user.id) });
}
