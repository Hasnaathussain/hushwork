import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  return product ? NextResponse.json({ product }) : NextResponse.json({ error: "Product not found." }, { status: 404 });
}
