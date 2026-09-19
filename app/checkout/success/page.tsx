"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  useEffect(() => clearCart(), [clearCart]);
  return <main className="success-page site-shell"><div className="success-card"><span className="success-mark"><Check size={24} /></span><p className="eyebrow">Order received</p><h1>Thank you<br /><em>for choosing well.</em></h1><p>Your payment has been received. We’ll send delivery updates to your email as soon as your order is on its way.</p><Link className="button button--dark" href="/shop">Continue shopping <ArrowRight size={16} /></Link></div></main>;
}
