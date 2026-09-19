"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export type CartItem = Pick<Product, "id" | "slug" | "name" | "priceCents" | "visual" | "stock"> & { imageUrl?: string; quantity: number };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  cartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hushwork-cart-v1";

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setItems(JSON.parse(stored) as CartItem[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setCartOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.slug === product.slug);
      if (existing) return current.map((item) => item.slug === product.slug ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) } : item);
      return [...current, { id: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, visual: product.visual, stock: product.stock, imageUrl: product.images[0]?.url, quantity: Math.min(quantity, product.stock) }];
    });
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    setItems((current) => current.map((item) => item.slug === slug ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item));
  }, []);

  const removeItem = useCallback((slug: string) => setItems((current) => current.filter((item) => item.slug !== slug)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  const value = useMemo(() => ({ items, itemCount, subtotalCents, cartOpen, addItem, updateQuantity, removeItem, clearCart, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false) }), [items, itemCount, subtotalCents, cartOpen, addItem, updateQuantity, removeItem, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

function CartDrawer() {
  const { items, itemCount, subtotalCents, cartOpen, closeCart, updateQuantity, removeItem } = useCart();
  return (
    <>
      {cartOpen && <button className="drawer-scrim" onClick={closeCart} aria-label="Close bag" />}
      <aside className={`cart-drawer ${cartOpen ? "cart-drawer--open" : ""}`} aria-label="Shopping bag" aria-hidden={!cartOpen}>
        <div className="cart-drawer__header">
          <div><p className="eyebrow">Your small collection</p><h2>Bag <span>{itemCount}</span></h2></div>
          <button className="icon-button" type="button" onClick={closeCart} aria-label="Close bag"><X size={20} /></button>
        </div>
        {items.length ? (
          <div className="cart-drawer__content">
          <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.slug}>
                  <div className="cart-item__swatch" aria-hidden="true">{item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="64px" /> : <span>{item.name.slice(0, 1)}</span>}</div>
                  <div className="cart-item__info"><Link href={`/product/${item.slug}`} onClick={closeCart}>{item.name}</Link><span>{formatPrice(item.priceCents)}</span><div className="quantity-control"><button type="button" onClick={() => item.quantity === 1 ? removeItem(item.slug) : updateQuantity(item.slug, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.slug, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= item.stock}><Plus size={13} /></button></div></div>
                  <button className="cart-item__remove" type="button" onClick={() => removeItem(item.slug)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="cart-drawer__summary"><span>Subtotal</span><strong>{formatPrice(subtotalCents)}</strong><small>Shipping is free over $75.</small></div>
            <Link className="button button--dark button--full" href="/checkout" onClick={closeCart}>Continue to checkout <ShoppingBag size={17} /></Link>
          </div>
        ) : (
          <div className="cart-empty"><ShoppingBag size={32} strokeWidth={1.2} /><p>Your bag is quiet.</p><span>Add something useful for the hours after.</span><Link className="text-link" href="/shop" onClick={closeCart}>Browse the shelf <span>↗</span></Link></div>
        )}
      </aside>
    </>
  );
}
