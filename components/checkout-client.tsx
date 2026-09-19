"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import type { User } from "@/lib/db";

export function CheckoutClient({ user }: { user: User | null }) {
  const { items, subtotalCents } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useRef<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    setPending(true);
    setError("");
    if (!idempotencyKey.current) idempotencyKey.current = globalThis.crypto?.randomUUID?.() ?? `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const form = new FormData(event.currentTarget);
    const body = {
      idempotencyKey: idempotencyKey.current,
      email: String(form.get("email") ?? ""),
      shippingName: String(form.get("shippingName") ?? ""),
      shippingAddress: String(form.get("shippingAddress") ?? ""),
      city: String(form.get("city") ?? ""),
      postalCode: String(form.get("postalCode") ?? ""),
      country: String(form.get("country") ?? ""),
      items: items.map((item) => ({ slug: item.slug, quantity: item.quantity }))
    };
    try {
      const response = await fetch("/api/checkout/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json() as { error?: string; url?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error ?? "We could not start secure checkout.");
      window.location.assign(payload.url);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not start secure checkout.");
      setPending(false);
    }
  }

  if (!items.length) return <main className="checkout-page site-shell"><div className="empty-state empty-state--large"><p>Your bag is empty.</p><Link className="button button--dark" href="/shop">Return to shop <ArrowRight size={16} /></Link></div></main>;

  const shippingCents = subtotalCents >= 7500 ? 0 : 850;
  return (
    <main className="checkout-page site-shell"><Link href="/shop" className="back-link"><ArrowLeft size={15} /> Keep shopping</Link><div className="checkout-grid"><div><p className="eyebrow">Secure checkout</p><h1>Bring it<br /><em>home.</em></h1><p className="checkout-lede">You’ll finish payment on our secure checkout partner. We never see or store your card details.</p><form className="checkout-form" onSubmit={onSubmit}><fieldset><legend>Delivery details</legend><label>Email<input name="email" type="email" autoComplete="email" defaultValue={user?.email ?? ""} required /></label><label>Name<input name="shippingName" autoComplete="name" defaultValue={user?.name ?? ""} required /></label><label>Address<input name="shippingAddress" autoComplete="street-address" required /></label><div className="form-row"><label>City<input name="city" autoComplete="address-level2" required /></label><label>Postal code<input name="postalCode" autoComplete="postal-code" required /></label></div><label>Country<input name="country" autoComplete="country-name" defaultValue="United States" required /></label></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--dark button--full" type="submit" disabled={pending}>{pending ? "Opening secure checkout…" : "Continue to payment"} <ArrowRight size={16} /></button><p className="secure-note"><LockKeyhole size={15} /> Encrypted payment handled by Stripe Checkout.</p></form></div><aside className="order-summary"><div className="order-summary__header"><p className="eyebrow">Your bag</p><span>{items.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>{items.map((item) => <div className="order-summary__item" key={item.slug}><span>{item.name} <small>× {item.quantity}</small></span><strong>{formatPrice(item.priceCents * item.quantity)}</strong></div>)}<div className="order-summary__line"><span>Subtotal</span><span>{formatPrice(subtotalCents)}</span></div><div className="order-summary__line"><span>Delivery</span><span>{shippingCents ? formatPrice(shippingCents) : "Free"}</span></div><div className="order-summary__total"><span>Total</span><strong>{formatPrice(subtotalCents + shippingCents)}</strong></div><div className="order-summary__trust"><ShieldCheck size={16} /><span>30-day returns<br />Tracked delivery</span></div></aside></div></main>
  );
}
