import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const products = await getProducts();
  const staticRoutes = ["", "/shop", "/about", "/materials", "/shipping-returns", "/contact", "/privacy", "/terms"].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : .6 }));
  return [...staticRoutes, ...products.map((product) => ({ url: `${base}/product/${product.slug}`, changeFrequency: "weekly" as const, priority: product.featured ? .8 : .5 }))];
}
