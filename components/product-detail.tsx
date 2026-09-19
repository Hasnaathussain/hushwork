"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductMedia } from "@/components/product-media";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/db";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const active = product.images[activeImage] ?? product.images[0];
  return (
    <main className="product-page site-shell">
      <Link href="/shop" className="back-link"><ArrowLeft size={15} /> Back to shop</Link>
      <div className="product-detail-grid">
        <div className="product-gallery">
          <ProductMedia product={product} image={active} variant="detail" priority />
          {product.images.length > 1 && <div className="product-gallery__thumbs" role="tablist" aria-label={`${product.name} images`}>{product.images.map((image, index) => <button type="button" key={`${image.url}-${index}`} className={activeImage === index ? "is-active" : ""} onClick={() => setActiveImage(index)} aria-label={`View ${image.role} image`}><ProductMedia product={product} image={image} variant="thumb" /></button>)}</div>}
        </div>
        <div className="product-detail__copy"><div className="product-detail__topline"><p className="eyebrow">{product.collection} / {product.category}</p><span className={product.stock > 0 ? "stock-label" : "stock-label stock-label--out"}>{product.stock > 0 ? "In stock" : "Sold out"}</span></div><h1>{product.name}</h1><p className="product-detail__description">{product.description}</p><div className="product-detail__price-row"><strong>{formatPrice(product.priceCents)}</strong><span>Free delivery over $75</span></div><div className="product-detail__buy"><div className="quantity-control quantity-control--large"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} aria-label="Increase quantity" disabled={quantity >= product.stock}><Plus size={15} /></button></div><button className="button button--dark" type="button" onClick={() => { addItem(product, quantity); openCart(); }} disabled={product.stock < 1}>Add to bag <ArrowRight size={16} /></button></div><div className="product-assurance"><span><Truck size={17} /><b>Ships in 1–2 days</b><small>Tracked delivery at checkout</small></span><span><ShieldCheck size={17} /><b>30-day returns</b><small>Simple, no-questions returns</small></span></div><div className="detail-notes"><div><span>Best used when</span><p>{product.bestUsedWhen}</p></div><div><span>About the object</span><p>{product.details}</p></div><div className="detail-notes__specs"><span>Details</span><dl><div><dt>Materials</dt><dd>{product.material}</dd></div><div><dt>Size</dt><dd>{product.dimensions}</dd></div><div><dt>Care</dt><dd>{product.care}</dd></div></dl></div></div></div>
      </div>
      <section className="product-story"><div><p className="eyebrow">Why it stays</p><h2>Made for use,<br /><em>not display.</em></h2></div><p>{product.details} The design is deliberately quiet so the object can become part of your actual routine, not another thing asking for attention.</p></section>
    </main>
  );
}
