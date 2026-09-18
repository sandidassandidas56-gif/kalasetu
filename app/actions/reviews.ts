'use server'

import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createReview(input: { productId: string; rating: number; body: string }) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'buyer') throw new Error('Buyer access required')
  const rating = Math.round(Number(input.rating))
  if (rating < 1 || rating > 5 || !input.body.trim() || input.body.trim().length > 2000) throw new Error('Rating and review are required')
  if (!hasDatabaseConnection()) {
    revalidatePath(`/product/${input.productId}`)
    return
  }
  const purchase = await db.execute(sql`SELECT 1 FROM marketplace_order_items i JOIN marketplace_orders o ON o.id = i."orderId" WHERE i."productId" = ${input.productId} AND o."buyerId" = ${session.user.id} AND o."paymentStatus" = 'paid' LIMIT 1`)
  const purchased = (purchase as unknown as { rows?: unknown[] }).rows?.length
  if (!purchased) throw new Error('Only verified buyers can review this product')
  await db.execute(sql`INSERT INTO reviews (id, "buyerId", "productId", rating, body) VALUES (${crypto.randomUUID()}, ${session.user.id}, ${input.productId}, ${rating}, ${input.body.trim()}) ON CONFLICT ("buyerId", "productId") DO UPDATE SET rating = EXCLUDED.rating, body = EXCLUDED.body`)
  revalidatePath(`/product/${input.productId}`)
}
