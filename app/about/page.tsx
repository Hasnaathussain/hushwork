import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "About HUSHWORK", description: "Why HUSHWORK makes useful objects for better transitions." };

export default function AboutPage() {
  return <main className="editorial-page site-shell"><p className="eyebrow">About HUSHWORK</p><h1>Useful objects<br /><em>for the in-between.</em></h1><div className="editorial-page__body"><p>HUSHWORK started with a simple question: what helps a day change shape? Not another productivity system. Not a room full of things that need looking after. A warmer light, a clean page, a small tool that does its job.</p><p>We keep the edit short and the materials honest: stoneware, cotton, paper, brass, glass. Pieces are made in small runs, chosen to be used often, and kept only when they earn their place.</p><Link className="button button--dark" href="/shop">Browse the current edit <ArrowRight size={16} /></Link></div></main>;
}
