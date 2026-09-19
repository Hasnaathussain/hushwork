import { NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const products = await getProducts({
    category: url.searchParams.get("category") ?? undefined,
    ritual: url.searchParams.get("ritual") ?? undefined,
    query: url.searchParams.get("q")?.slice(0, 80) ?? undefined
  });
  return NextResponse.json({ products });
}
