import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <main className="editorial-page site-shell"><p className="eyebrow">HUSHWORK / contact</p><h1>Let’s make the<br /><em>next hour easier.</em></h1><div className="editorial-page__body"><p>Questions about an order, a gift, or whether something belongs in your space? Send a note and a real person will reply within one business day.</p><Link className="button button--dark" href="mailto:hello@hushwork.store">Email hello@hushwork.store <ArrowUpRight size={16} /></Link><p className="support-meta">For order questions, include your order number so we can find the right thread quickly.</p></div></main>;
}
