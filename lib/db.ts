import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import postgres from "postgres";

export type ProductImage = {
  url: string;
  alt: string;
  role: "packshot" | "detail" | "lifestyle" | "scale";
  width: number;
  height: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  description: string;
  priceCents: number;
  visual: string;
  material: string;
  ritual: string;
  bestUsedWhen: string;
  details: string;
  dimensions: string;
  care: string;
  stock: number;
  featured: boolean;
  active: boolean;
  kind: "product" | "kit";
  images: ProductImage[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

export type OrderStatus = "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export type OrderSummary = {
  id: string;
  email: string;
  status: string;
  totalCents: number;
  createdAt: string;
  itemCount: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  description: string;
  price_cents: number;
  visual: string;
  material: string;
  ritual: string;
  best_used_when: string;
  details: string;
  dimensions: string;
  care: string;
  stock: number;
  featured: boolean;
  active: boolean;
  kind: "product" | "kit";
  images: unknown;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "customer" | "admin";
};

type Database = ReturnType<typeof postgres>;

let database: Database | null = null;

function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return value;
}

export function getDb(): Database {
  if (!database) {
    database = postgres(databaseUrl(), {
      max: process.env.NODE_ENV === "production" ? 5 : 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10
    });
  }
  return database;
}

function sessionDigest(token: string): string {
  const configuredSecret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
    throw new Error("AUTH_SECRET must be at least 32 characters in production.");
  }
  return createHmac("sha256", configuredSecret || "hushwork-development-only-secret").update(token).digest("hex");
}

function parseImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) return [];
  return value.filter((image): image is ProductImage => {
    if (!image || typeof image !== "object") return false;
    const candidate = image as Partial<ProductImage>;
    return typeof candidate.url === "string" && typeof candidate.alt === "string" && typeof candidate.role === "string" && typeof candidate.width === "number" && typeof candidate.height === "number";
  });
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    collection: row.collection,
    description: row.description,
    priceCents: Number(row.price_cents),
    visual: row.visual,
    material: row.material,
    ritual: row.ritual,
    bestUsedWhen: row.best_used_when,
    details: row.details,
    dimensions: row.dimensions,
    care: row.care,
    stock: Number(row.stock),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    kind: row.kind,
    images: parseImages(row.images)
  };
}

const catalogQuery = (db: Database, includeInactive = false) => db`
  SELECT
    p.id, p.slug, p.name, p.category, p.collection, p.description,
    p.price_cents, p.visual, p.material, p.ritual, p.best_used_when,
    p.details, p.dimensions, p.care, p.stock, p.featured, p.active, p.kind,
    COALESCE(
      json_agg(
        json_build_object('url', pi.url, 'alt', pi.alt, 'role', pi.role, 'width', pi.width, 'height', pi.height)
        ORDER BY pi.sort_order
      ) FILTER (WHERE pi.id IS NOT NULL),
      '[]'::json
    ) AS images
  FROM products p
  LEFT JOIN product_images pi ON pi.product_id = p.id
  WHERE (${includeInactive} = true OR p.active = true)
  GROUP BY p.id
  ORDER BY p.featured DESC, p.created_at ASC
`;

export async function getProducts(filters?: { category?: string; collection?: string; ritual?: string; query?: string }): Promise<Product[]> {
  const products = (await catalogQuery(getDb()) as unknown as ProductRow[]).map(toProduct);
  const query = filters?.query?.trim().toLowerCase();
  return products.filter((product) => {
    if (filters?.category && filters.category !== "all" && product.category !== filters.category) return false;
    if (filters?.collection && filters.collection !== "all" && product.collection !== filters.collection) return false;
    if (filters?.ritual && filters.ritual !== "all" && product.ritual !== filters.ritual) return false;
    if (query && !`${product.name} ${product.description} ${product.material} ${product.collection} ${product.category}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

export async function getAdminProducts(): Promise<Product[]> {
  return (await catalogQuery(getDb(), true) as unknown as ProductRow[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const rows = await getDb()`
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  ` as UserRow[];
  const row = rows[0];
  return row ? { id: row.id, name: row.name, email: row.email, role: row.role, passwordHash: row.password_hash } : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const rows = await getDb()`
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE id = ${id}
    LIMIT 1
  ` as UserRow[];
  const row = rows[0];
  return row ? { id: row.id, name: row.name, email: row.email, role: row.role } : null;
}

export async function createUser(input: { name: string; email: string; passwordHash: string }): Promise<User> {
  const user = { id: randomUUID(), name: input.name, email: input.email.toLowerCase(), passwordHash: input.passwordHash };
  await getDb()`
    INSERT INTO users (id, name, email, password_hash)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash})
  `;
  return { id: user.id, name: user.name, email: user.email, role: "customer" };
}

export async function storeSession(input: { token: string; userId: string; expiresAt: number }): Promise<void> {
  await getDb()`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${sessionDigest(input.token)}, ${input.userId}, ${input.expiresAt})
    ON CONFLICT (token_hash) DO UPDATE SET expires_at = EXCLUDED.expires_at
  `;
}

export async function findUserBySessionToken(token: string): Promise<User | null> {
  const rows = await getDb()`
    SELECT u.id, u.name, u.email, u.password_hash, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${sessionDigest(token)} AND s.expires_at > ${Date.now()}
    LIMIT 1
  ` as UserRow[];
  const row = rows[0];
  return row ? { id: row.id, name: row.name, email: row.email, role: row.role } : null;
}

export async function revokeSession(token: string): Promise<void> {
  await getDb()`DELETE FROM sessions WHERE token_hash = ${sessionDigest(token)}`;
}

export class OrderError extends Error {
  constructor(public code: "PRODUCT_NOT_FOUND" | "OUT_OF_STOCK" | "PAYMENT_EVENT_ALREADY_PROCESSED") {
    super(code);
  }
}

export async function createOrder(input: {
  userId?: string;
  email: string;
  shippingName: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  idempotencyKey: string;
  items: Array<{ slug: string; quantity: number }>;
  paymentEvent?: { id: string; type: string; provider: string; reference?: string };
}): Promise<{ id: string; totalCents: number; shippingCents: number }> {
  return getDb().begin(async (transaction) => {
    const previous = await transaction`
      SELECT id, total_cents, shipping_cents
      FROM orders
      WHERE idempotency_key = ${input.idempotencyKey} AND email = ${input.email}
      LIMIT 1
    ` as Array<{ id: string; total_cents: number; shipping_cents: number }>;
    if (previous[0]) return { id: previous[0].id, totalCents: Number(previous[0].total_cents), shippingCents: Number(previous[0].shipping_cents) };

    const resolvedItems: Array<{ product: Product; quantity: number }> = [];
    let subtotalCents = 0;

    for (const item of input.items) {
      const rows = await transaction`
        SELECT id, slug, name, category, collection, description, price_cents, visual, material, ritual, best_used_when, details, dimensions, care, stock, featured, active, kind, '[]'::json AS images
        FROM products
        WHERE slug = ${item.slug} AND active = true
        FOR UPDATE
      ` as ProductRow[];
      const row = rows[0];
      if (!row) throw new OrderError("PRODUCT_NOT_FOUND");
      const product = toProduct(row);
      if (product.stock < item.quantity) throw new OrderError("OUT_OF_STOCK");
      resolvedItems.push({ product, quantity: item.quantity });
      subtotalCents += product.priceCents * item.quantity;
    }

    const shippingCents = subtotalCents >= 7500 ? 0 : 850;
    const totalCents = subtotalCents + shippingCents;
    const orderId = `order_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
    await transaction`
      INSERT INTO orders (id, user_id, idempotency_key, email, status, subtotal_cents, shipping_cents, total_cents, shipping_name, shipping_address, city, postal_code, country)
      VALUES (${orderId}, ${input.userId ?? null}, ${input.idempotencyKey}, ${input.email}, 'paid', ${subtotalCents}, ${shippingCents}, ${totalCents}, ${input.shippingName}, ${input.shippingAddress}, ${input.city}, ${input.postalCode}, ${input.country})
    `;

    for (const item of resolvedItems) {
      await transaction`
        INSERT INTO order_items (id, order_id, product_id, product_name, unit_price_cents, quantity)
        VALUES (${randomUUID()}, ${orderId}, ${item.product.id}, ${item.product.name}, ${item.product.priceCents}, ${item.quantity})
      `;
      await transaction`
        UPDATE products SET stock = stock - ${item.quantity}, updated_at = NOW()
        WHERE id = ${item.product.id} AND stock >= ${item.quantity}
      `;
    }

    if (input.paymentEvent) {
      const paymentEvents = await transaction`
        INSERT INTO payment_events (id, provider, provider_event_id, type)
        VALUES (${input.paymentEvent.id}, ${input.paymentEvent.provider}, ${input.paymentEvent.id}, ${input.paymentEvent.type})
        ON CONFLICT (provider_event_id) DO NOTHING
        RETURNING id
      `;
      if (!paymentEvents.length) throw new OrderError("PAYMENT_EVENT_ALREADY_PROCESSED");
      await transaction`
        UPDATE orders SET payment_provider = ${input.paymentEvent.provider}, payment_reference = ${input.paymentEvent.reference ?? null}, updated_at = NOW()
        WHERE id = ${orderId}
      `;
    }

    return { id: orderId, totalCents, shippingCents };
  });
}

export async function getOrdersForUser(userId: string): Promise<OrderSummary[]> {
  const rows = await getDb()`
    SELECT o.id, o.email, o.status, o.total_cents, o.created_at, COALESCE(SUM(oi.quantity), 0) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ${userId}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  ` as Array<{ id: string; email: string; status: string; total_cents: number; created_at: string; item_count: number }>;
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    status: row.status,
    totalCents: Number(row.total_cents),
    createdAt: row.created_at,
    itemCount: Number(row.item_count)
  }));
}

export type AdminOrder = {
  id: string;
  email: string;
  status: OrderStatus;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  createdAt: string;
  shippingName: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  items: Array<{ name: string; quantity: number; unitPriceCents: number }>;
};

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const rows = await getDb()`
    SELECT o.id, o.email, o.status, o.total_cents, o.subtotal_cents, o.shipping_cents, o.created_at,
      o.shipping_name, o.shipping_address, o.city, o.postal_code, o.country,
      COALESCE(json_agg(json_build_object('name', oi.product_name, 'quantity', oi.quantity, 'unitPriceCents', oi.unit_price_cents) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 100
  ` as Array<{ id: string; email: string; status: OrderStatus; total_cents: number; subtotal_cents: number; shipping_cents: number; created_at: string; shipping_name: string; shipping_address: string; city: string; postal_code: string; country: string; items: unknown }>;
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    status: row.status,
    totalCents: Number(row.total_cents),
    subtotalCents: Number(row.subtotal_cents),
    shippingCents: Number(row.shipping_cents),
    createdAt: row.created_at,
    shippingName: row.shipping_name,
    shippingAddress: row.shipping_address,
    city: row.city,
    postalCode: row.postal_code,
    country: row.country,
    items: Array.isArray(row.items) ? row.items as AdminOrder["items"] : []
  }));
}

export async function updateAdminProduct(input: { slug: string; stock: number; active: boolean; actorUserId: string }): Promise<Product | null> {
  await getDb().begin(async (transaction) => {
    const rows = await transaction`
      UPDATE products SET stock = ${input.stock}, active = ${input.active}, updated_at = NOW()
      WHERE slug = ${input.slug}
      RETURNING id
    `;
    if (!rows.length) return;
    await transaction`
      INSERT INTO admin_audit_events (id, actor_user_id, action, entity_type, entity_id, metadata)
      VALUES (${randomUUID()}, ${input.actorUserId}, 'update', 'product', ${input.slug}, ${JSON.stringify({ stock: input.stock, active: input.active })}::jsonb)
    `;
  });
  return (await getAdminProducts()).find((product) => product.slug === input.slug) ?? null;
}

export async function updateAdminOrderStatus(input: { id: string; status: OrderStatus; actorUserId: string }): Promise<boolean> {
  return getDb().begin(async (transaction) => {
    const rows = await transaction`
      UPDATE orders SET status = ${input.status}, updated_at = NOW()
      WHERE id = ${input.id}
      RETURNING id
    `;
    if (!rows.length) return false;
    await transaction`
      INSERT INTO admin_audit_events (id, actor_user_id, action, entity_type, entity_id, metadata)
      VALUES (${randomUUID()}, ${input.actorUserId}, 'update_status', 'order', ${input.id}, ${JSON.stringify({ status: input.status })}::jsonb)
    `;
    return true;
  });
}

function resetTokenDigest(token: string): string {
  return sessionDigest(token);
}

export async function createPasswordResetToken(email: string): Promise<{ email: string; token: string } | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const token = randomUUID().replaceAll("-", "") + randomUUID().replaceAll("-", "");
  await getDb().begin(async (transaction) => {
    await transaction`DELETE FROM password_reset_tokens WHERE user_id = ${user.id} OR expires_at <= NOW()`;
    await transaction`
      INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
      VALUES (${resetTokenDigest(token)}, ${user.id}, NOW() + INTERVAL '30 minutes')
    `;
  });
  return { email: user.email, token };
}

export async function consumePasswordResetToken(token: string, passwordHash: string): Promise<boolean> {
  return getDb().begin(async (transaction) => {
    const rows = await transaction`
      SELECT user_id FROM password_reset_tokens
      WHERE token_hash = ${resetTokenDigest(token)} AND used_at IS NULL AND expires_at > NOW()
      FOR UPDATE
    ` as Array<{ user_id: string }>;
    if (!rows[0]) return false;
    await transaction`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${rows[0].user_id}`;
    await transaction`UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = ${resetTokenDigest(token)}`;
    await transaction`DELETE FROM sessions WHERE user_id = ${rows[0].user_id}`;
    return true;
  });
}
