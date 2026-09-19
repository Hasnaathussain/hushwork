"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductArt } from "@/components/product-art";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/db";

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const { addItem, openCart } = useCart();
  return (
    <article className={`product-card ${featured ? "product-card--featured" : ""}`}>
      <Link href={`/product/${product.slug}`} className="product-card__art-link" aria-label={`View ${product.name}`}>
        <ProductArt visual={product.visual} size={featured ? "hero" : "card"} />
        <span className="product-card__view"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="product-card__body">
        <div>
          <p className="eyebrow">{product.category} · {product.material}</p>
          <Link href={`/product/${product.slug}`} className="product-card__name">{product.name}</Link>
          <p className="product-card__description">{product.description}</p>
        </div>
        <div className="product-card__footer">
          <span className="price">{formatPrice(product.priceCents)}</span>
          <button
            type="button"
            className="icon-button icon-button--dark"
            onClick={() => { addItem(product); openCart(); }}
            aria-label={`Add ${product.name} to bag`}
            disabled={product.stock < 1}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
