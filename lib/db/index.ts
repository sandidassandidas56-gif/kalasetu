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
    )`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS products_seller_id_idx ON products ("sellerId")`)).then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS products_published_idx ON products (published)`)).then(() => undefined)
  return marketplaceSchemaReady
}
