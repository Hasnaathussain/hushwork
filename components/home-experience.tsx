"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, MoveUpRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import type { Product } from "@/lib/db";

const transitions = [
  { id: "focus", label: "Focus", title: "Clear the desk.", copy: "Paper, light, and tools that help the next hour feel possible." },
  { id: "reset", label: "Reset", title: "Change the room.", copy: "Small sensory cues for the part of the day that belongs to you." },
  { id: "travel", label: "Travel", title: "Take the ritual.", copy: "Compact, repairable pieces that earn their space in a bag." },
  { id: "gifts", label: "Gifts", title: "Give something useful.", copy: "Considered objects for people who are hard to buy for." }
];

export function HomeExperience({ products }: { products: Product[] }) {
  const [activeTransition, setActiveTransition] = useState("focus");
  const featured = useMemo(() => products.filter((product) => product.featured).slice(0, 4), [products]);
  const transition = transitions.find((item) => item.id === activeTransition) ?? transitions[0];
  const transitionProducts = useMemo(() => products.filter((product) => product.collection === activeTransition).slice(0, 3), [products, activeTransition]);
  const heroProduct = products.find((product) => product.slug === "low-lamp") ?? products[0];

  return (
    <main>
      <div className="announcement"><span>Free delivery on orders over $75</span><span>Designed for the in-between hours <MoveUpRight size={14} /></span></div>
      <section className="home-hero site-shell">
        <div className="home-hero__copy">
          <p className="eyebrow"><span className="eyebrow-line" /> HUSHWORK / RESET SYSTEMS</p>
          <h1>Better transitions<br /><em>between things.</em></h1>
          <p className="home-hero__lede">A small collection of useful objects for the move from work to rest, desk to dinner, inside to out.</p>
          <div className="home-hero__actions"><Link className="button button--dark" href="/shop">Shop all objects <ArrowRight size={16} /></Link><Link className="button button--outline" href="/collections/focus">Shop by need</Link></div>
          <div className="home-hero__proof"><span><Check size={14} /> Small-batch goods</span><span><Check size={14} /> Repairable materials</span><span><Check size={14} /> 30-day returns</span></div>
        </div>
        <div className="home-hero__visual">
          {heroProduct ? <ProductMedia product={heroProduct} variant="hero" priority /> : null}
          <div className="home-hero__label"><span>01 / 08</span><strong>THE LOW LAMP</strong><span>Ceramic · rechargeable · warm LED</span></div>
        </div>
      </section>

      <section className="trust-bar"><div className="site-shell trust-bar__inner"><span>Objects that earn their place</span><span>Thoughtful materials</span><span>Easy returns</span><span>Ships worldwide</span></div></section>

      <section className="home-section site-shell home-featured">
        <div className="section-intro"><div><p className="eyebrow">The current edit</p><h2>Start with the pieces<br /><em>you’ll actually use.</em></h2></div><Link className="text-link" href="/shop">View all objects <ArrowRight size={15} /></Link></div>
        <div className="product-grid product-grid--featured">{featured.map((product, index) => <ProductCard key={product.id} product={product} featured={index === 0} />)}</div>
      </section>

      <section className="transition-section">
        <div className="site-shell">
          <div className="section-intro section-intro--compact"><div><p className="eyebrow">Shop by transition</p><h2>What are you<br /><em>moving toward?</em></h2></div><p>Start with the moment, not the category. We’ll keep the selection useful.</p></div>
          <div className="transition-tabs" role="tablist" aria-label="Shop by transition">
            {transitions.map((item) => <button key={item.id} type="button" role="tab" aria-selected={activeTransition === item.id} className={activeTransition === item.id ? "is-active" : ""} onClick={() => setActiveTransition(item.id)}>{item.label}<span>0{transitions.indexOf(item) + 1}</span></button>)}
          </div>
          <div className="transition-panel" key={activeTransition}>
            <div className="transition-panel__copy"><p className="eyebrow">{transition.label} / selection</p><h3>{transition.title}</h3><p>{transition.copy}</p><Link className="text-link" href={`/collections/${transition.id}`}>See the {transition.label.toLowerCase()} edit <ArrowRight size={15} /></Link></div>
            <div className="transition-panel__products">{transitionProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          </div>
        </div>
      </section>

      <section className="kit-feature site-shell">
        <div className="kit-feature__media">{heroProduct ? <ProductMedia product={heroProduct} image={heroProduct.images[1]} variant="detail" priority /> : null}<span>THE RESET SYSTEM / 01</span></div>
        <div className="kit-feature__copy"><p className="eyebrow">A good place to begin</p><h2>The reset<br /><em>system.</em></h2><p>One warm light. One clean page. One object that makes the room feel ready for what comes next.</p><div className="kit-list"><span><b>01</b>Lower the light</span><span><b>02</b>Clear one surface</span><span><b>03</b>Keep the useful thing</span></div><Link className="button button--dark" href="/collections/reset">Shop the reset edit <ArrowRight size={16} /></Link></div>
      </section>

      <section className="materials-section"><div className="site-shell materials-section__inner"><div><p className="eyebrow">Why HUSHWORK</p><h2>Less, but<br /><em>better chosen.</em></h2></div><div className="materials-grid"><div><strong>01</strong><h3>Useful first</h3><p>Nothing is here to fill a shelf. Each piece has a job and a reason to stay.</p></div><div><strong>02</strong><h3>Honest materials</h3><p>Stoneware, cotton, paper, brass, and glass that age in a way you can live with.</p></div><div><strong>03</strong><h3>Small runs</h3><p>We make fewer things, keep the catalog edited, and restock with intention.</p></div></div></div></section>

      <section className="newsletter-section site-shell"><div><p className="eyebrow">The HUSHWORK note</p><h2>Useful ideas,<br /><em>occasionally.</em></h2></div><form className="newsletter-form" onSubmit={(event) => event.preventDefault()}><label>Email address<input type="email" placeholder="you@example.com" required /></label><button className="button button--dark" type="submit">Join the note <ArrowRight size={16} /></button><p>New objects, material notes, and small ways to reset. No noise.</p></form></section>
    </main>
  );
}
