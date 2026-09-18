'use server'

import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createInquiry(input: { sellerId: string; productId?: string; subject: string; message: string }) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'buyer') throw new Error('Buyer access required')
  if (!input.subject.trim() || !input.message.trim()) throw new Error('Subject and message are required')
  if (!hasDatabaseConnection()) {
    revalidatePath('/buyer/inquiries')
    revalidatePath('/seller/inquiries')
    return
  }
  await db.execute(sql`INSERT INTO inquiries (id, "buyerId", "sellerId", "productId", subject, message) VALUES (${crypto.randomUUID()}, ${session.user.id}, ${input.sellerId}, ${input.productId ?? null}, ${input.subject.trim()}, ${input.message.trim()})`)
  revalidatePath('/buyer/inquiries')
  revalidatePath('/seller/inquiries')
}
