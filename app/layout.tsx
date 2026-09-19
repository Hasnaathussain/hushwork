import type { Metadata } from "next";
import "./globals.css";
import { AssistantDock } from "@/components/assistant-dock";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "HUSHWORK — Useful things for the hours after", template: "%s — HUSHWORK" },
  description: "Small-batch light, scent, paper, and tools for the hours after.",
  applicationName: "HUSHWORK",
  referrer: "origin-when-cross-origin",
  keywords: ["small batch objects", "home goods", "ritual objects", "HUSHWORK"]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader />
          {children}
          <AssistantDock />
        </CartProvider>
      </body>
    </html>
  );
}
