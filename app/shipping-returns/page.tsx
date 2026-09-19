import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping & returns" };

export default function ShippingReturnsPage() {
  return <main className="editorial-page site-shell"><p className="eyebrow">Help / shipping & returns</p><h1>Good to know<br /><em>before you order.</em></h1><div className="support-grid"><section><h2>Shipping</h2><p>Orders leave our studio within 1–2 business days. Tracked delivery estimates appear at checkout based on your address.</p></section><section><h2>Returns</h2><p>Changed your mind? Start a return within 30 days of delivery. Items should be unused and in their original packaging.</p></section><section><h2>Need a hand?</h2><p>Email hello@hushwork.store with your order number. We’ll get back to you within one business day.</p></section></div></main>;
}
