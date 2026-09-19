import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'

export async function GET() {
  const session = await getCurrentSession()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session?.user || role !== 'seller') {
    return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json({
      summary: { totalProducts: 0, published: 0, pendingOrders: 0, completedOrders: 0, revenue: 0, inquiries: 0 },
      recentOrders: [],
      topProducts: [],
    })
  }

  const sellerId = session.user.id
  const rows = (value: unknown) => (value as { rows?: Record<string, unknown>[] }).rows ?? []
  const productSummary = await db.execute(sql`
    SELECT count(*)::int AS "totalProducts", count(*) FILTER (WHERE published = true)::int AS published
    FROM products WHERE "sellerId" = ${sellerId}
  `)

  let pendingOrders = 0
  let completedOrders = 0
  let revenue = 0
  let inquiries = 0
  try {
    const orderSummary = await db.execute(sql`
      SELECT
        count(DISTINCT oi."orderId") FILTER (WHERE o."orderStatus" NOT IN ('delivered', 'cancelled'))::int AS "pendingOrders",
        count(DISTINCT oi."orderId") FILTER (WHERE o."orderStatus" = 'delivered' AND o."paymentStatus" = 'paid')::int AS "completedOrders",
        COALESCE(sum(oi.quantity * oi."unitPrice") FILTER (WHERE o."paymentStatus" = 'paid'), 0)::numeric AS revenue
      FROM marketplace_order_items oi JOIN marketplace_orders o ON o.id = oi."orderId"
      WHERE oi."sellerId" = ${sellerId}
    `)
    const orderRow = ((orderSummary as { rows?: Record<string, unknown>[] }).rows ?? [])[0]
    pendingOrders = Number(orderRow?.pendingOrders ?? 0)
    completedOrders = Number(orderRow?.completedOrders ?? 0)
    revenue = Number(orderRow?.revenue ?? 0)
  } catch {
    // Order tables are optional until marketplace checkout is configured.
  }
  try {
    const inquirySummary = await db.execute(sql`SELECT count(*)::int AS count FROM inquiries WHERE "sellerId" = ${sellerId}`)
    inquiries = Number(((inquirySummary as { rows?: { count?: number }[] }).rows ?? [])[0]?.count ?? 0)
  } catch {
    // Inquiry tables are optional until buyer messaging is configured.
  }

  let recentOrders: Record<string, unknown>[] = []
  try {
    const ordersResult = await db.execute(sql`
    SELECT DISTINCT ON (o.id)
      o.id AS "orderId",
      COALESCE(u.name, 'Buyer') AS buyer,
      p.name AS item,
      (oi.quantity * oi."unitPrice")::numeric AS amount,
      o."orderStatus" AS status
    FROM marketplace_order_items oi
    JOIN marketplace_orders o ON o.id = oi."orderId"
    JOIN products p ON p.id = oi."productId"
    LEFT JOIN "user" u ON u.id = o."buyerId"
    WHERE oi."sellerId" = ${sellerId}
    ORDER BY o.id, o."createdAt" DESC
    LIMIT 5
    `)
    recentOrders = rows(ordersResult)
  } catch {
    // Order tables are optional until marketplace checkout is configured.
  }

  let topProducts: Record<string, unknown>[] = []
  try {
    const productsResult = await db.execute(sql`
    SELECT
      p.name,
      COALESCE(sum(oi.quantity), 0)::int AS sales,
      COALESCE(sum(oi.quantity * oi."unitPrice"), 0)::numeric AS revenue
    FROM products p
    LEFT JOIN marketplace_order_items oi ON oi."productId" = p.id
    LEFT JOIN marketplace_orders o ON o.id = oi."orderId" AND o."paymentStatus" = 'paid'
    WHERE p."sellerId" = ${sellerId}
    GROUP BY p.id, p.name
    ORDER BY sales DESC, p.name
    LIMIT 5
    `)
    topProducts = rows(productsResult)
  } catch {
    const productsResult = await db.execute(sql`SELECT name, 0::int AS sales, 0::numeric AS revenue FROM products WHERE "sellerId" = ${sellerId} ORDER BY "createdAt" DESC LIMIT 5`)
    topProducts = rows(productsResult)
  }

  return NextResponse.json({
    summary: { ...(rows(productSummary)[0] ?? { totalProducts: 0, published: 0 }), pendingOrders, completedOrders, revenue, inquiries },
    recentOrders,
    topProducts,
  })
}
