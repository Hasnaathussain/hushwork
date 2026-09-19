import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/auth";
import { getProducts } from "@/lib/db";
import { assertSameOrigin, checkRateLimit, requestKey } from "@/lib/security";
import { orderSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!request.headers.has("authorization")) assertSameOrigin(request);
    if (!checkRateLimit(requestKey(request, "checkout"), 8, 10 * 60_000)) return NextResponse.json({ error: "Too many checkout attempts. Try again later." }, { status: 429 });
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: "Secure checkout is not configured for this deployment yet." }, { status: 503 });
    const body = orderSchema.parse(await request.json());
    const products = await getProducts();
    const catalog = new Map(products.map((product) => [product.slug, product]));
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotalCents = 0;
    for (const item of body.items) {
      const product = catalog.get(item.slug);
      if (!product) return NextResponse.json({ error: "One of the products is no longer available." }, { status: 404 });
      if (product.stock < item.quantity) return NextResponse.json({ error: `${product.name} does not have enough stock.` }, { status: 409 });
      subtotalCents += product.priceCents * item.quantity;
      lineItems.push({ price_data: { currency: "usd", product_data: { name: product.name, description: product.description }, unit_amount: product.priceCents }, quantity: item.quantity });
    }
    const user = await getUserFromRequest(request);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: user?.email ?? body.email,
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "NL", "PK"] },
      shipping_options: subtotalCents >= 7500 ? [] : [{ shipping_rate_data: { display_name: "Standard delivery", type: "fixed_amount", fixed_amount: { amount: 850, currency: "usd" }, delivery_estimate: { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 6 } } } }],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      metadata: {
        idempotencyKey: body.idempotencyKey,
        userId: user?.id ?? "",
        email: body.email,
        shippingName: body.shippingName,
        shippingAddress: body.shippingAddress,
        city: body.city,
        postalCode: body.postalCode,
        country: body.country,
        items: JSON.stringify(body.items)
      }
    });
    if (!session.url) return NextResponse.json({ error: "Secure checkout did not return a payment link." }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    return NextResponse.json({ error: "We could not start secure checkout." }, { status: 400 });
  }
}
