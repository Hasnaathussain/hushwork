import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrder, OrderError } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";
import { orderSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = orderSchema.parse(await request.json());
    const user = await getCurrentUser();
    const order = createOrder({ ...body, userId: user?.id });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      const status = error.code === "OUT_OF_STOCK" ? 409 : 404;
      return NextResponse.json({ error: error.code === "OUT_OF_STOCK" ? "One of those objects just sold out." : "One of those objects is no longer on the shelf." }, { status });
    }
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    return NextResponse.json({ error: "We could not place that order. Check the details and try again." }, { status: 400 });
  }
}
