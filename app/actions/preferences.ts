import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'

export async function savePreferences(formData: FormData) {
  'use server'
  const session = await getCurrentSession()
  if (!session?.user?.id) redirect('/auth')
  const userId = session.user.id
  const orderUpdates = formData.get('orderUpdates') === 'on'
  const inquiryUpdates = formData.get('inquiryUpdates') === 'on'
  const marketingUpdates = formData.get('marketingUpdates') === 'on'
  if (!hasDatabaseConnection()) return
  await db.execute(sql`CREATE TABLE IF NOT EXISTS user_preferences (id text PRIMARY KEY, "userId" text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE, "orderUpdates" boolean NOT NULL DEFAULT true, "inquiryUpdates" boolean NOT NULL DEFAULT true, "marketingUpdates" boolean NOT NULL DEFAULT false, "updatedAt" timestamptz NOT NULL DEFAULT now())`)
  await db.execute(sql`INSERT INTO user_preferences (id, "userId", "orderUpdates", "inquiryUpdates", "marketingUpdates") VALUES (${crypto.randomUUID()}, ${userId}, ${orderUpdates}, ${inquiryUpdates}, ${marketingUpdates}) ON CONFLICT ("userId") DO UPDATE SET "orderUpdates" = EXCLUDED."orderUpdates", "inquiryUpdates" = EXCLUDED."inquiryUpdates", "marketingUpdates" = EXCLUDED."marketingUpdates", "updatedAt" = now()`)
}

export async function getPreferences() {
  const session = await getCurrentSession()
  if (!session?.user?.id) return null
  if (!hasDatabaseConnection()) return null
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS user_preferences (id text PRIMARY KEY, "userId" text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE, "orderUpdates" boolean NOT NULL DEFAULT true, "inquiryUpdates" boolean NOT NULL DEFAULT true, "marketingUpdates" boolean NOT NULL DEFAULT false, "updatedAt" timestamptz NOT NULL DEFAULT now())`)
    const result = await db.execute(sql`SELECT "orderUpdates", "inquiryUpdates", "marketingUpdates" FROM user_preferences WHERE "userId" = ${session.user.id} LIMIT 1`)
    return (result as unknown as { rows?: Record<string, unknown>[] }).rows?.[0] ?? null
  } catch {
    return null
  }
}
