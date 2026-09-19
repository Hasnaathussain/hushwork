"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [{ href: "/shop", label: "Shop" }, { href: "/#after-hours", label: "After hours" }, { href: "/account", label: "Account" }];
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" onClick={() => setMenuOpen(false)}><span className="wordmark-mark" />HUSHWORK</Link>
      <nav className={`site-nav ${menuOpen ? "site-nav--open" : ""}`} aria-label="Main navigation">
        {nav.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "is-active" : ""} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
      </nav>
      <div className="site-header__actions">
        <button className="bag-button" type="button" onClick={openCart} aria-label={`Open bag with ${itemCount} item${itemCount === 1 ? "" : "s"}`}><ShoppingBag size={17} /><span>{String(itemCount).padStart(2, "0")}</span></button>
        <button className="menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
  );
}
