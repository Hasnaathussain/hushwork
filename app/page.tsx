import type { Metadata } from "next";
import { HomeExperience } from "@/components/home-experience";
import { getProducts } from "@/lib/db";

export const metadata: Metadata = {
  title: "Reset systems for real life",
  description: "Useful objects for better transitions between work and rest."
};

export default async function HomePage() {
  return <HomeExperience products={await getProducts()} />;
}
