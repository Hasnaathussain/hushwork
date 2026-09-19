import "server-only";

import DatabaseConstructor from "better-sqlite3";
import { createHmac, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

type SqliteDatabase = ReturnType<typeof DatabaseConstructor>;

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  priceCents: number;
  visual: string;
  material: string;
  ritual: string;
  bestUsedWhen: string;
  details: string;
  stock: number;
  featured: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

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
  description: string;
  price_cents: number;
  visual: string;
  material: string;
  ritual: string;
  best_used_when: string;
  details: string;
  stock: number;
  featured: number;
};
type UserRow = User & { password_hash: string; created_at: string };

function sessionDigest(token: string): string {
  const configuredSecret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
    throw new Error("AUTH_SECRET must be at least 32 characters in production.");
  }
  return createHmac("sha256", configuredSecret || "hushwork-development-only-secret").update(token).digest("hex");
}

const seedProducts = [
  {
    id: "prod_last_match",
    slug: "the-last-match-candle",
    name: "The Last Match Candle",
    category: "light",
    description: "Beeswax, cedar, and the small ceremony of striking one more match.",
    priceCents: 3400,
    visual: "candle",
    material: "Beeswax + cedar",
    ritual: "host",
    bestUsedWhen: "Dinner is nearly ready and nobody needs to rush.",
    details: "A clean-burning beeswax candle poured in a smoked glass tumbler. The cedar note stays close to the table and softens as the flame settles.",
    stock: 24,
    featured: 1
  },
  {
    id: "prod_night_ledger",
    slug: "night-ledger",
    name: "Night Ledger",
    category: "write",
    description: "An unruled place for lists, fragments, and the thought that almost got away.",
    priceCents: 1800,
    visual: "ledger",
    material: "FSC paper + cloth spine",
    ritual: "read",
    bestUsedWhen: "The room is quiet enough to hear the pencil move.",
    details: "Sixty-four unruled pages, rounded corners, and a cloth-wrapped spine that gets softer with use.",
    stock: 31,
    featured: 1
  },
  {
    id: "prod_ashwood_incense",
    slug: "ashwood-incense-no-02",
    name: "Ashwood Incense No. 02",
    category: "scent",
    description: "Dry pine, black tea, and a trace of smoke for an open window.",
    priceCents: 2200,
    visual: "incense",
    material: "Pine + black tea",
    ritual: "unwind",
    bestUsedWhen: "The day is still in the walls but no longer in the room.",
    details: "Twenty hand-rolled sticks with a mineral ceramic rest. Light for a minute, then let the room finish the sentence.",
    stock: 18,
    featured: 1
  },
  {
    id: "prod_sunday_cup",
    slug: "sunday-cup",
    name: "Sunday Cup",
    category: "table",
    description: "Speckled stoneware with a thumb-sized handle and no identical twin.",
    priceCents: 4200,
    visual: "cup",
    material: "Speckled stoneware",
    ritual: "host",
    bestUsedWhen: "Coffee has become a conversation.",
    details: "Thrown in small batches, glazed by hand, and fired with enough variation to keep the set from feeling like a set.",
    stock: 12,
    featured: 1
  },
  {
    id: "prod_mending_tin",
    slug: "the-mending-tin",
    name: "The Mending Tin",
    category: "carry",
    description: "Waxed thread, brass needle, linen patches, and a tiny pair of scissors.",
    priceCents: 2900,
    visual: "tin",
    material: "Brass + linen + waxed thread",
    ritual: "repair",
    bestUsedWhen: "Something small deserves another year.",
    details: "A pocket-sized repair kit assembled in a hinged steel tin. Useful on a desk, in a drawer, or in the bottom of a bag.",
    stock: 27,
    featured: 0
  },
  {
    id: "prod_pocket_cloth",
    slug: "pocket-cloth",
    name: "Pocket Cloth",
    category: "carry",
    description: "A soft cotton square for glasses, cameras, bread, or whatever needs carrying gently.",
    priceCents: 1600,
    visual: "cloth",
    material: "Washed cotton",
    ritual: "wander",
    bestUsedWhen: "You are leaving with less than you came in with.",
    details: "A 35cm square of densely woven cotton, finished with a raw edge that improves with every wash.",
    stock: 42,
    featured: 0
  },
  {
    id: "prod_low_lamp",
    slug: "low-lamp",
    name: "Low Lamp",
    category: "light",
    description: "A portable ceramic lamp with an amber glow and no visible switch.",
    priceCents: 9600,
    visual: "lamp",
    material: "Ceramic + warm LED",
    ritual: "read",
    bestUsedWhen: "The overhead light has done enough for one day.",
    details: "A rechargeable stoneware lamp that turns on with a palm resting on its cap. Six hours of low light per charge.",
    stock: 9,
    featured: 1
  },
  {
    id: "prod_house_matches",
    slug: "house-blend-matches",
    name: "House Blend Matches",
    category: "editions",
    description: "Forty oversized matches in a screen-printed drawer box. Striker included.",
    priceCents: 1200,
    visual: "matches",
    material: "Wood + vegetable ink",
    ritual: "host",
    bestUsedWhen: "A small spark is the whole point.",
    details: "A limited print run in a drawer-style box with a full-width striker and extra-long stems for candles and incense.",
    stock: 55,
    featured: 0
  }
] as const;

let database: SqliteDatabase | null = null;

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    priceCents: row.price_cents,
    visual: row.visual,
    material: row.material,
    ritual: row.ritual,
    bestUsedWhen: row.best_used_when,
    details: row.details,
    stock: row.stock,
    featured: Boolean(row.featured)
  };
}

function toUser(row: UserRow): User {
  return { id: row.id, name: row.name, email: row.email };
}

export function getDb(): SqliteDatabase {
  if (database) return database;

  const dataDirectory = path.join(process.cwd(), ".data");
  mkdirSync(dataDirectory, { recursive: true });
  database = new DatabaseConstructor(path.join(dataDirectory, "hushwork.db"));
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
      visual TEXT NOT NULL,
      material TEXT NOT NULL,
      ritual TEXT NOT NULL,
      best_used_when TEXT NOT NULL,
      details TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      idempotency_key TEXT,
      email TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('placed', 'cancelled')),
      subtotal_cents INTEGER NOT NULL,
      shipping_cents INTEGER NOT NULL,
      total_cents INTEGER NOT NULL,
      shipping_name TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0)
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  `);

  const orderColumns = database.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>;
  if (!orderColumns.some((column) => column.name === "idempotency_key")) database.exec("ALTER TABLE orders ADD COLUMN idempotency_key TEXT");
  database.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL");

  const productCount = database.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    const insert = database.prepare(`
      INSERT INTO products (id, slug, name, category, description, price_cents, visual, material, ritual, best_used_when, details, stock, featured)
      VALUES (@id, @slug, @name, @category, @description, @priceCents, @visual, @material, @ritual, @bestUsedWhen, @details, @stock, @featured)
    `);
    const seed = database.transaction(() => {
      for (const product of seedProducts) insert.run(product);
    });
    seed();
  }

  return database;
}

export function getProducts(filters?: { category?: string; ritual?: string; query?: string }): Product[] {
  const db = getDb();
  const conditions: string[] = [];
  const values: Record<string, string> = {};

  if (filters?.category && filters.category !== "all") {
    conditions.push("category = @category");
    values.category = filters.category;
  }
  if (filters?.ritual && filters.ritual !== "all") {
    conditions.push("ritual = @ritual");
    values.ritual = filters.ritual;
  }
  if (filters?.query) {
    conditions.push("(name LIKE @query OR description LIKE @query OR material LIKE @query)");
    values.query = `%${filters.query}%`;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db.prepare(`SELECT * FROM products ${where} ORDER BY featured DESC, created_at ASC`).all(values) as ProductRow[];
  return rows.map(toProduct);
}

export function getProductBySlug(slug: string): Product | null {
  const row = getDb().prepare("SELECT * FROM products WHERE slug = ?").get(slug) as ProductRow | undefined;
  return row ? toProduct(row) : null;
}

export function findUserByEmail(email: string): (User & { passwordHash: string }) | null {
  const row = getDb().prepare("SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?").get(email) as UserRow | undefined;
  return row ? { ...toUser(row), passwordHash: row.password_hash } : null;
}

export function findUserById(id: string): User | null {
  const row = getDb().prepare("SELECT id, name, email, password_hash, created_at FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function createUser(input: { name: string; email: string; passwordHash: string }): User {
  const user = { id: randomUUID(), ...input };
  getDb().prepare("INSERT INTO users (id, name, email, password_hash) VALUES (@id, @name, @email, @passwordHash)").run(user);
  return { id: user.id, name: user.name, email: user.email };
}

export function storeSession(input: { token: string; userId: string; expiresAt: number }): void {
  const tokenHash = sessionDigest(input.token);
  getDb().prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash, input.userId, input.expiresAt);
}

export function findUserBySessionToken(token: string): User | null {
  const tokenHash = sessionDigest(token);
  const row = getDb().prepare(`
    SELECT u.id, u.name, u.email, u.password_hash, u.created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(tokenHash, Date.now()) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function revokeSession(token: string): void {
  const tokenHash = sessionDigest(token);
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

export class OrderError extends Error {
  constructor(public code: "PRODUCT_NOT_FOUND" | "OUT_OF_STOCK") {
    super(code);
  }
}

export function createOrder(input: {
  userId?: string;
  email: string;
  shippingName: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  idempotencyKey: string;
  items: Array<{ slug: string; quantity: number }>;
}): { id: string; totalCents: number; shippingCents: number } {
  const db = getDb();
  const create = db.transaction(() => {
    const previousOrder = db.prepare("SELECT id, total_cents, shipping_cents FROM orders WHERE idempotency_key = ? AND email = ?").get(input.idempotencyKey, input.email) as { id: string; total_cents: number; shipping_cents: number } | undefined;
    if (previousOrder) return { id: previousOrder.id, totalCents: previousOrder.total_cents, shippingCents: previousOrder.shipping_cents };

    const resolvedItems: Array<{ product: Product; quantity: number }> = [];
    let subtotalCents = 0;

    for (const item of input.items) {
      const product = getProductBySlug(item.slug);
      if (!product) throw new OrderError("PRODUCT_NOT_FOUND");
      if (product.stock < item.quantity) throw new OrderError("OUT_OF_STOCK");
      resolvedItems.push({ product, quantity: item.quantity });
      subtotalCents += product.priceCents * item.quantity;
    }

    const shippingCents = subtotalCents >= 7500 ? 0 : 850;
    const orderId = `order_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
    db.prepare(`
      INSERT INTO orders (id, user_id, idempotency_key, email, status, subtotal_cents, shipping_cents, total_cents, shipping_name, shipping_address, city, postal_code, country)
      VALUES (@id, @userId, @idempotencyKey, @email, 'placed', @subtotalCents, @shippingCents, @totalCents, @shippingName, @shippingAddress, @city, @postalCode, @country)
    `).run({
      id: orderId,
      userId: input.userId ?? null,
      idempotencyKey: input.idempotencyKey,
      email: input.email,
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      shippingName: input.shippingName,
      shippingAddress: input.shippingAddress,
      city: input.city,
      postalCode: input.postalCode,
      country: input.country
    });

    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_name, unit_price_cents, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const decrementStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
    for (const item of resolvedItems) {
      insertItem.run(randomUUID(), orderId, item.product.id, item.product.name, item.product.priceCents, item.quantity);
      decrementStock.run(item.quantity, item.product.id);
    }

    return { id: orderId, totalCents: subtotalCents + shippingCents, shippingCents };
  });

  return create();
}

export function getOrdersForUser(userId: string): OrderSummary[] {
  const rows = getDb().prepare(`
    SELECT o.id, o.email, o.status, o.total_cents, o.created_at, COALESCE(SUM(oi.quantity), 0) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all(userId) as Array<{
    id: string;
    email: string;
    status: string;
    total_cents: number;
    created_at: string;
    item_count: number;
  }>;
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    status: row.status,
    totalCents: row.total_cents,
    createdAt: row.created_at,
    itemCount: row.item_count
  }));
}
