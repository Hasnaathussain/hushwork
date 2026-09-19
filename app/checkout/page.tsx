import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  return <CheckoutClient user={await getCurrentUser()} />;
}
