"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MotionStory } from "@/components/motion-story";
import { ProductArt } from "@/components/product-art";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/db";

const hours = [
  { label: "5 PM", title: "Soft landing", copy: "The day is loosening its grip. Start with something warm." },
  { label: "7 PM", title: "Table light", copy: "Dinner can be simple. The room does the rest." },
  { label: "9 PM", title: "A slower page", copy: "Give your hands a small, useful thing to do." },
  { label: "Midnight", title: "Leave one light on", copy: "For the thoughts that only arrive after everyone leaves." }
];

export function HomeExperience({ products }: { products: Product[] }) {
  const [hourIndex, setHourIndex] = useState(2);
  const mode = hours[hourIndex];
  const featured = useMemo(() => products.filter((product) => product.featured).slice(0, 5), [products]);
  return (
    <main className="site-shell overflow-clip">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" />Useful things for the hours after</p>
          <h1>Make the ordinary<br /><em>feel intentional.</em></h1>
          <p className="hero-lede">A considered collection of light, scent, paper, and small tools for the part of the day that belongs only to you.</p>
          <div className="hero-actions"><Link className="button button--dark" href="/shop">Shop the edit <ArrowUpRight size={17} /></Link><a className="button button--quiet" href="#after-hours">Set the room <ArrowDownRight size={17} /></a></div>
        </div>
        <div className="hero-object-wrap">
          <div className="hero-object-noise" />
          <ProductArt visual="lamp" size="hero" />
          <div className="hero-object-caption"><span>LOW LAMP</span><span>ceramic / amber light</span></div>
        </div>
        <div className="hero-floor-note"><span>Small runs</span><span>Repairable materials</span><span>Made for use</span></div>
      </section>

      <section className="ritual-section section-padding" id="after-hours">
        <div className="section-heading section-heading--split"><div><p className="eyebrow">The after-hours dial</p><h2>Choose a mood.<br /><em>We’ll set the shelf.</em></h2></div><p>Turn the dial to move through the evening. HUSHWORK changes its recommendation, not because you need more things, but because the same room asks for different ones.</p></div>
        <div className="dial-panel">
          <div className="dial-panel__readout"><span className="dial-time">{mode.label}</span><h3>{mode.title}</h3><p>{mode.copy}</p></div>
          <div className="dial-control" style={{ "--dial-progress": `${(hourIndex / (hours.length - 1)) * 100}%` } as React.CSSProperties}>
            <div className="dial-ring"><span className="dial-core">{String(hourIndex + 1).padStart(2, "0")}</span></div>
            <input type="range" min="0" max={hours.length - 1} step="1" value={hourIndex} onChange={(event) => setHourIndex(Number(event.target.value))} aria-label="Choose an hour" />
            <div className="dial-labels"><span>5 PM</span><span>7 PM</span><span>9 PM</span><span>12 AM</span></div>
          </div>
        </div>
      </section>

      <section className="collection-section section-padding" id="shop">
        <div className="section-heading"><div><p className="eyebrow">On the shelf now</p><h2>Pick a ritual,<br /><em>not a category.</em></h2></div><Link className="text-link" href="/shop">See every object <ArrowUpRight size={17} /></Link></div>
        <div className="product-grid product-grid--bento">
          {featured.map((product, index) => <ProductCard key={product.id} product={product} featured={index === 0} />)}
        </div>
      </section>

      <MotionStory />

      <section className="maker-section section-padding">
        <div className="maker-section__stamp">HW<br /><span>made to last</span></div>
        <div><p className="eyebrow">A note from the shelf</p><h2>Nothing here is<br /><em>precious enough to hide.</em></h2></div>
        <div className="maker-section__copy"><p>We like objects that show their use: a notebook that opens flat, a cup that knows your thumb, a matchbox that gets better at its job.</p><p>Every HUSHWORK piece is sourced or made in small runs, with materials that can be repaired, refilled, or passed along.</p><Link className="text-link" href="/shop">Find your next small thing <ArrowUpRight size={17} /></Link></div>
      </section>

      <section className="closing-cta"><div className="closing-cta__orb" /><p className="eyebrow">Stay for one more page</p><h2>Leave the overhead<br /><em>light off.</em></h2><Link className="button button--paper" href="/shop">Browse HUSHWORK <ArrowUpRight size={17} /></Link></section>
    </main>
  );
}
