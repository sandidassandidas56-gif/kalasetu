import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { sql } from 'drizzle-orm'

const databaseUrl = process.env.DATABASE_URL

export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null

export function hasDatabaseConnection() {
  return Boolean(databaseUrl)
}

export function requireDb() {
  if (!databaseUrl || !pool) {
    throw new Error('DATABASE_URL is not configured. Add it to your .env.local and restart the app.')
  }
  return drizzle(pool)
}

export const db = databaseUrl ? drizzle(pool!) : ({
  execute: async () => ({ rows: [] }),
} as unknown as ReturnType<typeof drizzle>)

let marketplaceSchemaReady: Promise<void> | null = null

export function ensureMarketplaceSchema() {
  if (!pool) return Promise.reject(new Error('DATABASE_URL is not configured.'))
  marketplaceSchemaReady ??= db.execute(sql`CREATE TABLE IF NOT EXISTS seller_profiles (
      id text PRIMARY KEY,
      "userId" text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
      "avatarUrl" text NOT NULL DEFAULT '', "shopName" text NOT NULL DEFAULT '',
      address text NOT NULL DEFAULT '', bio text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '',
      state text NOT NULL DEFAULT '', "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS products (
      id text PRIMARY KEY,
      "sellerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      name text NOT NULL, description text NOT NULL, category text NOT NULL, price numeric NOT NULL,
      "imageUrl" text NOT NULL DEFAULT '', state text NOT NULL DEFAULT '', availability text NOT NULL DEFAULT 'available',
      published boolean NOT NULL DEFAULT false, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`)).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS carts (
      id text PRIMARY KEY,
      "buyerId" text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`)).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS cart_items (
      id text PRIMARY KEY,
      "cartId" text NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      "productId" text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity integer NOT NULL DEFAULT 1,
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
      UNIQUE ("cartId", "productId")
    )`)).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS wishlists (
      id text PRIMARY KEY,
      "buyerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "productId" text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      UNIQUE ("buyerId", "productId")
    )`)).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS marketplace_orders (
      id text PRIMARY KEY,
      "buyerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      subtotal numeric NOT NULL DEFAULT 0,
      shipping numeric NOT NULL DEFAULT 0,
      total numeric NOT NULL DEFAULT 0,
      "shippingAddress" text NOT NULL DEFAULT '',
      "paymentStatus" text NOT NULL DEFAULT 'pending_payment',
      "orderStatus" text NOT NULL DEFAULT 'pending_payment',
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`)).then(() => db.execute(sql`ALTER TABLE marketplace_orders ADD COLUMN IF NOT EXISTS "paymentMethod" text NOT NULL DEFAULT 'order_request'`)).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS marketplace_order_items (
      id text PRIMARY KEY,
      "orderId" text NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
      "productId" text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      "sellerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      quantity integer NOT NULL DEFAULT 1,
      "unitPrice" numeric NOT NULL DEFAULT 0,
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`)).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS inquiries (
      id text PRIMARY KEY,
      "buyerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "sellerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "productId" text REFERENCES products(id) ON DELETE SET NULL,
      subject text NOT NULL,
      message text NOT NULL,
      status text NOT NULL DEFAULT 'new',
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`)).then(() => db.execute(sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "sellerResponse" text NOT NULL DEFAULT ''`)).then(() => db.execute(sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "respondedAt" timestamptz`)).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS notifications (
      id text PRIMARY KEY,
      "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      title text NOT NULL,
      body text NOT NULL,
      "read" boolean NOT NULL DEFAULT false,
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`)).then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS reviews (
      id text PRIMARY KEY,
      "buyerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "productId" text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
      body text NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
      UNIQUE ("buyerId", "productId")
    )`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS products_seller_id_idx ON products ("sellerId")`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS products_published_idx ON products (published)`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS marketplace_orders_buyer_idx ON marketplace_orders ("buyerId")`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS marketplace_order_items_seller_idx ON marketplace_order_items ("sellerId")`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS inquiries_seller_idx ON inquiries ("sellerId")`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications ("userId")`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews ("productId")`)).then(() => undefined)
  return marketplaceSchemaReady
}
