import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder, OrderError } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return NextResponse.json({ error: "Payment webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  try {
    const stripe = new Stripe(secret);
    const event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata ?? {};
      const items = JSON.parse(metadata.items ?? "[]") as Array<{ slug: string; quantity: number }>;
      if (!metadata.idempotencyKey || !metadata.email || !items.length) return NextResponse.json({ error: "Incomplete payment metadata." }, { status: 400 });
      await createOrder({
        idempotencyKey: metadata.idempotencyKey,
        userId: metadata.userId || undefined,
        email: metadata.email,
        shippingName: metadata.shippingName ?? "",
        shippingAddress: metadata.shippingAddress ?? "",
        city: metadata.city ?? "",
        postalCode: metadata.postalCode ?? "",
        country: metadata.country ?? "",
        items,
        paymentEvent: { id: event.id, provider: "stripe", type: event.type, reference: session.id }
      });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof OrderError && error.code === "PAYMENT_EVENT_ALREADY_PROCESSED") return NextResponse.json({ received: true, duplicate: true });
    return NextResponse.json({ error: "Invalid payment webhook." }, { status: 400 });
  }
}
