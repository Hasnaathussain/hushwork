import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopClient } from "@/components/shop-client";
import { getProducts } from "@/lib/db";

const labels: Record<string, string> = { focus: "Focus", reset: "Reset", travel: "Travel", gifts: "Gifts", refills: "Refills" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return labels[slug] ? { title: `${labels[slug]} collection`, description: `The HUSHWORK ${labels[slug].toLowerCase()} collection.` } : { title: "Collection not found" };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!labels[slug]) notFound();
  return <ShopClient products={await getProducts({ collection: slug })} initialCollection={slug} />;
}
