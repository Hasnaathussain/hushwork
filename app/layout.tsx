import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AssistantDock } from "@/components/assistant-dock";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "HUSHWORK — Reset systems for real life", template: "%s — HUSHWORK" },
  description: "A considered collection of useful objects for better transitions between work and rest.",
  applicationName: "HUSHWORK",
  referrer: "origin-when-cross-origin",
  keywords: ["desk essentials", "home goods", "small batch objects", "HUSHWORK"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <SiteHeader />
          {children}
          <footer className="site-footer"><div className="site-shell site-footer__inner"><div><span className="wordmark wordmark--footer"><span className="wordmark-mark">H</span><span>HUSHWORK</span></span><p>Useful objects for the in-between.</p></div><div className="site-footer__links"><Link href="/shop">Shop</Link><Link href="/about">About</Link><Link href="/materials">Materials & care</Link><Link href="/shipping-returns">Shipping & returns</Link><Link href="/contact">Contact</Link><Link href="/account">Account</Link></div><small>© {new Date().getFullYear()} HUSHWORK. Made to be used. <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></small></div></footer>
          <AssistantDock />
        </CartProvider>
      </body>
    </html>
  );
}
