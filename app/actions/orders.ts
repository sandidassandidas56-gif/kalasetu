'use server'

import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const statuses = ['confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'] as const

export async function updateSellerOrderStatus(orderId: string, status: string) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') throw new Error('Seller access required')
  if (!statuses.includes(status as (typeof statuses)[number])) throw new Error('Invalid order status')
  if (!hasDatabaseConnection()) {
    revalidatePath('/seller/orders')
    revalidatePath('/buyer/orders')
    revalidatePath('/buyer/notifications')
    return
  }
  const access = await db.execute(sql`SELECT 1 FROM marketplace_order_items WHERE "orderId" = ${orderId} AND "sellerId" = ${session.user.id} LIMIT 1`)
  if (!((access as unknown as { rows?: unknown[] }).rows ?? []).length) throw new Error('Order access denied')
  await db.execute(sql`UPDATE marketplace_orders SET "orderStatus" = ${status} WHERE id = ${orderId} AND "paymentStatus" IN ('paid', 'unavailable')`)
  const buyer = await db.execute(sql`SELECT "buyerId" FROM marketplace_orders WHERE id = ${orderId}`)
  const buyerId = (buyer as unknown as { rows?: { buyerId: string }[] }).rows?.[0]?.buyerId
  if (buyerId) await db.execute(sql`INSERT INTO notifications (id, "userId", title, body) VALUES (${crypto.randomUUID()}, ${buyerId}, ${'Order ' + status}, ${'Your order ' + orderId.slice(0, 8) + ' is now ' + status + '.'})`)
  revalidatePath('/seller/orders')
  revalidatePath('/buyer/orders')
  revalidatePath('/buyer/notifications')
}

export { statuses }
