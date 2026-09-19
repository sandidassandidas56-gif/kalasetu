'use server'

import { getCurrentSession, auth } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { addDemoCartItem, createDemoCheckoutOrder, getDemoBuyerCart, getDemoBuyerOrders, toggleDemoWishlist } from '@/lib/demo-data'

type BuyerCartRow = { id: string; quantity: number; product_id: string; name: string; price: number; imageUrl?: string; availability: string; seller_name?: string }

async function getBuyerId() {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'buyer') throw new Error('Buyer access required')
  return session.user.id
}

export async function addToCart(productId: string, quantity = 1) {
  const buyerId = await getBuyerId()
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) throw new Error('Quantity must be a whole number between 1 and 50')
  if (!hasDatabaseConnection()) {
    addDemoCartItem(buyerId, productId, quantity)
    revalidatePath('/buyer')
    revalidatePath('/buyer/cart')
    return
  }
  await db.execute(sql`INSERT INTO carts (id, "buyerId") VALUES (${crypto.randomUUID()}, ${buyerId}) ON CONFLICT ("buyerId") DO NOTHING`)
  await db.execute(sql`INSERT INTO cart_items (id, "cartId", "productId", quantity) SELECT ${crypto.randomUUID()}, c.id, ${productId}, ${quantity} FROM carts c JOIN products p ON p.id = ${productId} WHERE c."buyerId" = ${buyerId} AND p.published = true AND p.availability = 'available' ON CONFLICT ("cartId", "productId") DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, 50)`)
  revalidatePath('/buyer')
  revalidatePath('/buyer/cart')
}

export async function toggleWishlist(productId: string) {
  const buyerId = await getBuyerId()
  if (!hasDatabaseConnection()) {
    toggleDemoWishlist(buyerId, productId)
    revalidatePath('/buyer')
    revalidatePath('/buyer/wishlist')
    return
  }
  const existing = await db.execute(sql`SELECT id FROM wishlists WHERE "buyerId" = ${buyerId} AND "productId" = ${productId} LIMIT 1`)
  const rows = (existing as unknown as { rows?: { id: string }[] }).rows ?? []
  if (rows[0]) await db.execute(sql`DELETE FROM wishlists WHERE id = ${rows[0].id}`)
  else await db.execute(sql`INSERT INTO wishlists (id, "buyerId", "productId") SELECT ${crypto.randomUUID()}, ${buyerId}, id FROM products WHERE id = ${productId} AND published = true ON CONFLICT DO NOTHING`)
  revalidatePath('/buyer')
  revalidatePath('/buyer/wishlist')
}

export async function getBuyerCart() {
  const buyerId = await getBuyerId()
  if (!hasDatabaseConnection()) {
    return getDemoBuyerCart(buyerId).map((item) => ({ id: String(item.id), quantity: Number(item.quantity), product_id: String(item.product_id), name: String(item.name), price: Number(item.price), imageUrl: item.imageUrl ? String(item.imageUrl) : undefined, availability: String(item.availability), seller_name: item.seller_name ? String(item.seller_name) : undefined })) as BuyerCartRow[]
  }
  const result = await db.execute(sql`SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p."imageUrl", p.availability, COALESCE(sp."shopName", u.name) AS seller_name FROM carts c JOIN cart_items ci ON ci."cartId" = c.id JOIN products p ON p.id = ci."productId" LEFT JOIN seller_profiles sp ON sp."userId" = p."sellerId" LEFT JOIN "user" u ON u.id = p."sellerId" WHERE c."buyerId" = ${buyerId} ORDER BY ci."createdAt" DESC`)
  return ((result as unknown as { rows?: Record<string, unknown>[] }).rows ?? []).map(row => ({ id: String(row.id), quantity: Number(row.quantity), product_id: String(row.product_id), name: String(row.name), price: Number(row.price), imageUrl: row.imageUrl ? String(row.imageUrl) : undefined, availability: String(row.availability), seller_name: row.seller_name ? String(row.seller_name) : undefined })) as BuyerCartRow[]
}

export async function createCheckoutOrder(address: string, paymentMethod: 'cash_on_delivery' | 'order_request' = 'cash_on_delivery') {
  const buyerId = await getBuyerId()
  if (!address.trim()) throw new Error('Shipping address is required')
  if (!hasDatabaseConnection()) {
    const order = createDemoCheckoutOrder(buyerId, address)
    revalidatePath('/buyer')
    revalidatePath('/buyer/cart')
    revalidatePath('/buyer/orders')
    revalidatePath('/seller')
    return { id: order.id, paymentStatus: paymentMethod === 'cash_on_delivery' ? 'cod_pending' as const : 'unavailable' as const, total: order.total }
  }
  const cart = await getBuyerCart()
  const available = cart.filter(item => item.availability === 'available')
  if (!available.length) throw new Error('Your cart is empty or contains unavailable products')
  const subtotal = available.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const orderId = crypto.randomUUID()
  const paymentStatus = paymentMethod === 'cash_on_delivery' ? 'cod_pending' : 'unavailable'
  await db.execute(sql`INSERT INTO marketplace_orders (id, "buyerId", subtotal, shipping, total, "shippingAddress", "paymentStatus", "paymentMethod", "orderStatus") VALUES (${orderId}, ${buyerId}, ${subtotal}, 0, ${subtotal}, ${address.trim()}, ${paymentStatus}, ${paymentMethod}, 'pending_payment')`)
  for (const item of available) await db.execute(sql`INSERT INTO marketplace_order_items (id, "orderId", "productId", "sellerId", quantity, "unitPrice") SELECT ${crypto.randomUUID()}, ${orderId}, p.id, p."sellerId", ${item.quantity}, p.price FROM products p WHERE p.id = ${String(item.product_id)} AND p.published = true AND p.availability = 'available'`)
  await db.execute(sql`DELETE FROM cart_items WHERE "cartId" IN (SELECT id FROM carts WHERE "buyerId" = ${buyerId})`)
  revalidatePath('/buyer')
  revalidatePath('/buyer/cart')
  revalidatePath('/buyer/orders')
  revalidatePath('/seller')
  return { id: orderId, paymentStatus, total: subtotal }
}

export async function getBuyerOrders() {
  const buyerId = await getBuyerId()
  if (!hasDatabaseConnection()) {
    return getDemoBuyerOrders(buyerId)
  }
  const result = await db.execute(sql`SELECT id, subtotal, shipping, total, "paymentStatus", "paymentMethod", "orderStatus", "shippingAddress", "createdAt" FROM marketplace_orders WHERE "buyerId" = ${buyerId} ORDER BY "createdAt" DESC`)
  return (result as unknown as { rows?: Record<string, unknown>[] }).rows ?? []
}
