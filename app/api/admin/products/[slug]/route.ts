import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateAdminProduct } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";
import { adminProductSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    const body = adminProductSchema.parse(await request.json());
    const product = await updateAdminProduct({ ...(await params), ...body, actorUserId: user.id });
    return product ? NextResponse.json({ product }) : NextResponse.json({ error: "Product not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Could not update that product." }, { status: 400 });
  }
}
