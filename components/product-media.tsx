import Image from "next/image";
import type { Product, ProductImage } from "@/lib/db";

export function ProductMedia({ product, image, variant = "card", priority = false }: { product: Product; image?: ProductImage; variant?: "card" | "hero" | "detail" | "thumb"; priority?: boolean }) {
  const selected = image ?? product.images[0];
  if (!selected) return <div className={`product-media product-media--${variant} product-media--fallback`}><span>{product.name}</span></div>;
  return (
    <div className={`product-media product-media--${variant}`}>
      <Image src={selected.url} alt={selected.alt} fill sizes={variant === "hero" ? "(max-width: 800px) 100vw, 58vw" : variant === "detail" ? "(max-width: 800px) 100vw, 62vw" : "(max-width: 800px) 50vw, 28vw"} priority={priority} className="product-media__image" />
    </div>
  );
}
