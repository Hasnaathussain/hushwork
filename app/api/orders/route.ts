import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to view orders." }, { status: 401 });
  return NextResponse.json({ orders: await getOrdersForUser(user.id) });
}

export async function POST() {
  return NextResponse.json({ error: "Orders are created only after verified payment." }, { status: 405 });
}
