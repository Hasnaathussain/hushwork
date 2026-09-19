import type { Metadata } from "next";
import { ShopClient } from "@/components/shop-client";
import { getProducts } from "@/lib/db";

export const metadata: Metadata = {
  title: "The shelf",
  description: "Browse the current HUSHWORK collection."
};

export default async function ShopPage() {
  return <ShopClient products={await getProducts()} />;
}
