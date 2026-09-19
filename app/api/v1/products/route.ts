import { NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.json({ products: await getProducts({ collection: url.searchParams.get("collection") ?? undefined, query: url.searchParams.get("q")?.slice(0, 80) ?? undefined }) });
}
