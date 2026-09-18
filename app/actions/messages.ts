'use server'

import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function sendMessage(input: { recipientId: string; body: string }) {
  const session = await getCurrentSession()
  if (!session?.user || !input.body.trim()) throw new Error('Message required')
  if (!hasDatabaseConnection()) {
    revalidatePath('/buyer/messages'); revalidatePath('/seller/messages')
    return
  }
  await db.execute(sql`INSERT INTO messages (id, "senderId", "recipientId", body) VALUES (${crypto.randomUUID()}, ${session.user.id}, ${input.recipientId}, ${input.body.trim()})`)
  revalidatePath('/buyer/messages'); revalidatePath('/seller/messages')
}
