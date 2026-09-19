"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/db";

const collections = ["all", "focus", "reset", "travel", "gifts", "refills"];
const sortOptions = ["featured", "price-low", "price-high"];

export function ShopClient({ products, initialCollection = "all" }: { products: Product[]; initialCollection?: string }) {
  const [collection, setCollection] = useState(collections.includes(initialCollection) ? initialCollection : "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => collection === "all" || product.collection === collection)
      .filter((product) => !inStockOnly || product.stock > 0)
      .filter((product) => !query || `${product.name} ${product.description} ${product.material} ${product.collection}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => sort === "price-low" ? a.priceCents - b.priceCents : sort === "price-high" ? b.priceCents - a.priceCents : Number(b.featured) - Number(a.featured));
  }, [products, collection, query, sort, inStockOnly]);

  function resetFilters() {
    setCollection("all");
    setQuery("");
    setSort("featured");
    setInStockOnly(false);
  }

  return (
    <main className="shop-page site-shell">
      <section className="shop-heading"><div><p className="eyebrow">The HUSHWORK catalog</p><h1>Find the thing<br /><em>that helps.</em></h1></div><p>Objects for focus, reset, travel, and the people you want to give something useful.</p></section>
      <section className="shop-toolbar" aria-label="Catalog filters">
        <div className="collection-tabs" role="tablist" aria-label="Collections">{collections.map((item) => <button key={item} type="button" role="tab" aria-selected={collection === item} className={collection === item ? "is-active" : ""} onClick={() => setCollection(item)}>{item === "all" ? "All objects" : item[0].toUpperCase() + item.slice(1)}</button>)}</div>
        <div className="shop-toolbar__bottom"><label className="search-field"><Search size={16} /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /></label><label className="filter-check"><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} /> In stock</label><label className="sort-field"><SlidersHorizontal size={16} /><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => setSort(event.target.value)}>{sortOptions.map((item) => <option key={item} value={item}>{item === "featured" ? "Featured" : item === "price-low" ? "Price: low to high" : "Price: high to low"}</option>)}</select></label></div>
      </section>
      <div className="shop-results-bar"><span>{visibleProducts.length} {visibleProducts.length === 1 ? "object" : "objects"}</span><span>Free delivery over $75</span>{(query || collection !== "all" || inStockOnly || sort !== "featured") && <button type="button" onClick={resetFilters}><X size={14} /> Clear filters</button>}</div>
      {visibleProducts.length ? <div className="product-grid product-grid--shop">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><p>No objects match those filters.</p><button className="button button--dark" type="button" onClick={resetFilters}>Reset catalog</button></div>}
    </main>
  );
}
