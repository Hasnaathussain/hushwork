import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const orders = await getOrdersForUser(user.id);
  return <main className="site-shell account-page"><div className="account-hero"><div className="account-avatar"><UserRound size={22} /></div><div><p className="eyebrow">Your HUSHWORK account</p><h1>Hello, <em>{user.name.split(" ")[0]}.</em></h1><p>Order history and saved details, kept in one place.</p></div><LogoutButton /></div><section className="account-orders"><div className="section-intro"><div><p className="eyebrow">Order history</p><h2>What you brought<br /><em>home.</em></h2></div><Link className="text-link" href="/shop">Shop the edit <ArrowUpRight size={16} /></Link></div>{orders.length ? <div className="orders-list">{orders.map((order) => <div className="order-row" key={order.id}><div><span className="order-id">{order.id}</span><p>{formatDate(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}</p></div><div><span className={`status status--${order.status}`}>{order.status}</span><strong>{formatPrice(order.totalCents)}</strong></div></div>)}</div> : <div className="empty-state"><p>No orders yet.</p><Link className="button button--dark" href="/shop">Browse the catalog <ArrowUpRight size={17} /></Link></div>}</section></main>;
}
