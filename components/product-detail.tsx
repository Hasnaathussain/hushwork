"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductArt } from "@/components/product-art";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/db";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  return (
    <main className="site-shell product-page">
      <Link href="/shop" className="back-link"><ArrowLeft size={16} /> Back to the shelf</Link>
      <div className="product-detail-grid">
        <div className="product-detail__visual"><ProductArt visual={product.visual} size="detail" /><span className="product-detail__visual-note">HUSHWORK / {product.category}</span></div>
        <div className="product-detail__copy"><p className="eyebrow">{product.category} · {product.material}</p><h1>{product.name}</h1><p className="product-detail__description">{product.description}</p><div className="product-detail__price-row"><strong>{formatPrice(product.priceCents)}</strong><span>{product.stock > 0 ? `${product.stock} in the small run` : "Currently resting"}</span></div><div className="product-detail__buy"><div className="quantity-control quantity-control--large"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} aria-label="Increase quantity" disabled={quantity >= product.stock}><Plus size={15} /></button></div><button className="button button--dark" type="button" onClick={() => { addItem(product, quantity); openCart(); }} disabled={product.stock < 1}>Add to bag <ArrowUpRight size={17} /></button></div><div className="detail-notes"><div><span>Best used when</span><p>{product.bestUsedWhen}</p></div><div><span>About the object</span><p>{product.details}</p></div></div></div>
      </div>
    </main>
  );
}
