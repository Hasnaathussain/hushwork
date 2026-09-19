"use client";

import { useState } from "react";
import { Check, LoaderCircle, PackageCheck } from "lucide-react";
import type { AdminOrder, OrderStatus, Product } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

const statuses: OrderStatus[] = ["paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function AdminConsole({ products: initialProducts, orders: initialOrders }: { products: Product[]; orders: AdminOrder[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [saving, setSaving] = useState("");
  const [notice, setNotice] = useState("");

  async function saveProduct(product: Product, changes: { stock?: number; active?: boolean }) {
    const next = { stock: changes.stock ?? product.stock, active: changes.active ?? product.active };
    setSaving(`product:${product.slug}`);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/products/${product.slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      const payload = await response.json() as { product?: Product; error?: string };
      if (!response.ok || !payload.product) throw new Error(payload.error ?? "Could not save product.");
      setProducts((items) => items.map((item) => item.slug === product.slug ? payload.product! : item));
      setNotice(`${product.name} saved.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save product.");
    } finally {
      setSaving("");
    }
  }

  async function saveOrderStatus(order: AdminOrder, status: OrderStatus) {
    setSaving(`order:${order.id}`);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not save order.");
      setOrders((items) => items.map((item) => item.id === order.id ? { ...item, status } : item));
      setNotice(`${order.id} updated.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save order.");
    } finally {
      setSaving("");
    }
  }

  return (
    <main className="admin-page site-shell">
      <div className="admin-heading"><div><p className="eyebrow">HUSHWORK operations</p><h1>Keep the shelf<br /><em>in good shape.</em></h1></div><div className="admin-heading__meta"><PackageCheck size={18} /><span>{products.filter((product) => product.active).length} active products<br />{orders.length} recent orders</span></div></div>
      {notice && <p className="admin-notice" role="status"><Check size={15} /> {notice}</p>}
      <section className="admin-section"><div className="section-intro"><div><p className="eyebrow">Catalog</p><h2>Stock and visibility</h2></div><span className="admin-section__hint">Changes are logged.</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Object</th><th>Price</th><th>Stock</th><th>Live</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.slug}><td><strong>{product.name}</strong><small>{product.collection} · {product.category}</small></td><td>{formatPrice(product.priceCents)}</td><td><input className="admin-number" type="number" min={0} max={1000000} defaultValue={product.stock} aria-label={`Stock for ${product.name}`} onBlur={(event) => { const stock = Number(event.currentTarget.value); if (Number.isInteger(stock) && stock !== product.stock) void saveProduct(product, { stock }); }} /></td><td><label className="admin-toggle"><input type="checkbox" checked={product.active} onChange={(event) => void saveProduct(product, { active: event.target.checked })} /><span>{product.active ? "Live" : "Hidden"}</span></label></td><td>{saving === `product:${product.slug}` && <LoaderCircle className="spin" size={16} aria-label="Saving" />}</td></tr>)}</tbody></table></div></section>
      <section className="admin-section"><div className="section-intro"><div><p className="eyebrow">Orders</p><h2>Move them forward</h2></div><span className="admin-section__hint">Showing the latest 100.</span></div>{orders.length ? <div className="admin-orders">{orders.map((order) => <article className="admin-order" key={order.id}><div className="admin-order__top"><div><strong>{order.id}</strong><small>{formatDate(order.createdAt)} · {order.email}</small></div><strong>{formatPrice(order.totalCents)}</strong></div><div className="admin-order__body"><p>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p><small>{order.shippingName}, {order.city}, {order.country}</small></div><div className="admin-order__actions"><select value={order.status} aria-label={`Status for ${order.id}`} onChange={(event) => void saveOrderStatus(order, event.target.value as OrderStatus)}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>{saving === `order:${order.id}` && <LoaderCircle className="spin" size={16} aria-label="Saving" />}</div></article>)}</div> : <div className="empty-state"><p>No orders yet.</p></div>}</section>
    </main>
  );
}
