import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminConsole } from "@/components/admin-console";
import { getCurrentUser } from "@/lib/auth";
import { getAdminOrders, getAdminProducts } from "@/lib/db";

export const metadata: Metadata = { title: "Operations" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") notFound();
  const [products, orders] = await Promise.all([getAdminProducts(), getAdminOrders()]);
  return <AdminConsole products={products} orders={orders} />;
}
