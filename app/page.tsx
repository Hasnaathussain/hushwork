import type { Metadata } from "next";
import { HomeExperience } from "@/components/home-experience";
import { getProducts } from "@/lib/db";

export const metadata: Metadata = {
  title: "Useful things for the hours after",
  description: "A considered collection of light, scent, paper, and small tools for the part of the day that belongs only to you."
};

export default function HomePage() {
  return <HomeExperience products={getProducts()} />;
}
