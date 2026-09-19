"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/db";

const categories = ["all", "light", "scent", "table", "write", "carry", "editions"];
const rituals = ["all", "read", "host", "repair", "wander", "unwind"];

export function ShopClient({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("all");
  const [ritual, setRitual] = useState("all");
  const [query, setQuery] = useState("");
  const visibleProducts = useMemo(() => products.filter((product) => (category === "all" || product.category === category) && (ritual === "all" || product.ritual === ritual) && (!query || `${product.name} ${product.description} ${product.material}`.toLowerCase().includes(query.toLowerCase()))), [products, category, ritual, query]);
  return (
    <main className="site-shell shop-page">
      <section className="shop-intro"><p className="eyebrow">The full shelf</p><h1>Useful things<br /><em>for later.</em></h1><p>Small-batch objects for reading, hosting, repairing, wandering, and the softer edges of the day.</p></section>
      <section className="shop-controls" aria-label="Filter objects">
        <div className="category-tabs">{categories.map((item) => <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="shop-controls__tools"><label className="search-field"><Search size={16} /><span className="sr-only">Search objects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the shelf" /></label><label className="select-field"><SlidersHorizontal size={16} /><span className="sr-only">Filter by ritual</span><select value={ritual} onChange={(event) => setRitual(event.target.value)}>{rituals.map((item) => <option key={item} value={item}>{item === "all" ? "Every ritual" : `For ${item}`}</option>)}</select></label></div>
      </section>
      <div className="shop-meta"><span>{visibleProducts.length} objects</span><span>Free shipping over $75</span></div>
      {visibleProducts.length ? <div className="product-grid product-grid--shop">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><p>No object matches that mood.</p><button className="button button--dark" type="button" onClick={() => { setCategory("all"); setRitual("all"); setQuery(""); }}>Reset the shelf</button></div>}
    </main>
  );
}
