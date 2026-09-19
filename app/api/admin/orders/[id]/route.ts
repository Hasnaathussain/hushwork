import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateAdminOrderStatus } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";
import { adminOrderStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    const body = adminOrderStatusSchema.parse(await request.json());
    const updated = await updateAdminOrderStatus({ id: (await params).id, ...body, actorUserId: user.id });
    return updated ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Order not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Could not update that order." }, { status: 400 });
  }
}
