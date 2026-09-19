"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import type { User } from "@/lib/db";

export function CheckoutClient({ user }: { user: User | null }) {
  const { items, subtotalCents, clearCart } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<{ id: string; totalCents: number } | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json() as { error?: string; order?: { id: string; totalCents: number } };
      if (!response.ok || !payload.order) throw new Error(payload.error ?? "We could not place that order.");
      setConfirmation(payload.order);
      idempotencyKey.current = null;
      clearCart();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not place that order.");
    } finally {
      setPending(false);
    }
  }

  if (confirmation) return <main className="site-shell checkout-page"><div className="confirmation-card"><div className="confirmation-card__mark"><Check size={28} /></div><p className="eyebrow">The shelf has your order</p><h1>See you<br /><em>after hours.</em></h1><p>Your order <strong>{confirmation.id}</strong> is placed in demo commerce mode. We’ll keep the details safe and ready for the next real payment integration.</p><div className="confirmation-card__total"><span>Total</span><strong>{formatPrice(confirmation.totalCents)}</strong></div><Link className="button button--dark" href="/shop">Keep browsing <ArrowUpRight size={17} /></Link></div></main>;
  if (!items.length) return <main className="site-shell checkout-page"><div className="empty-state empty-state--large"><p>Your bag is empty.</p><Link className="button button--dark" href="/shop">Return to the shelf <ArrowUpRight size={17} /></Link></div></main>;

  const shippingCents = subtotalCents >= 7500 ? 0 : 850;
  return (
    <main className="site-shell checkout-page"><Link href="/shop" className="back-link"><ArrowLeft size={16} /> Keep browsing</Link><div className="checkout-grid"><div><p className="eyebrow">A quiet checkout</p><h1>Bring it<br /><em>home.</em></h1><form className="checkout-form" onSubmit={onSubmit}><fieldset><legend>Where should we send it?</legend><label>Email<input name="email" type="email" autoComplete="email" defaultValue={user?.email ?? ""} required /></label><label>Name<input name="shippingName" autoComplete="name" defaultValue={user?.name ?? ""} required /></label><label>Address<input name="shippingAddress" autoComplete="street-address" required /></label><div className="form-row"><label>City<input name="city" autoComplete="address-level2" required /></label><label>Postal code<input name="postalCode" autoComplete="postal-code" required /></label></div><label>Country<input name="country" autoComplete="country-name" defaultValue="United States" required /></label></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<p className="demo-payment-note"><LockKeyhole size={15} /> This portfolio checkout places a real order in the local database. No card details are collected.</p><button className="button button--dark button--full" type="submit" disabled={pending}>{pending ? "Placing your order…" : "Place demo order"} <ArrowUpRight size={17} /></button></form></div><aside className="order-summary"><div className="order-summary__header"><p className="eyebrow">Your collection</p><span>{items.length} line{items.length === 1 ? "" : "s"}</span></div>{items.map((item) => <div className="order-summary__item" key={item.slug}><span>{item.name} <small>× {item.quantity}</small></span><strong>{formatPrice(item.priceCents * item.quantity)}</strong></div>)}<div className="order-summary__line"><span>Subtotal</span><span>{formatPrice(subtotalCents)}</span></div><div className="order-summary__line"><span>Shipping</span><span>{shippingCents ? formatPrice(shippingCents) : "Free"}</span></div><div className="order-summary__total"><span>Total</span><strong>{formatPrice(subtotalCents + shippingCents)}</strong></div></aside></div></main>
  );
}
