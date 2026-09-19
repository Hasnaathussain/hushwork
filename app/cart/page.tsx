import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = { title: "Your bag" };

export default function CartRoute() {
  return <CartPage />;
}
