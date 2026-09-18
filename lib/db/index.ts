import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

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
