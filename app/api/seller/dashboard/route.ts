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
  const summaryResult = await db.execute(sql`
    SELECT
      (SELECT count(*)::int FROM products WHERE "sellerId" = ${sellerId}) AS "totalProducts",
      (SELECT count(*)::int FROM products WHERE "sellerId" = ${sellerId} AND published = true) AS published,
      (SELECT count(DISTINCT oi."orderId")::int FROM marketplace_order_items oi JOIN marketplace_orders o ON o.id = oi."orderId" WHERE oi."sellerId" = ${sellerId} AND o."orderStatus" NOT IN ('delivered', 'cancelled')) AS "pendingOrders",
      (SELECT count(DISTINCT oi."orderId")::int FROM marketplace_order_items oi JOIN marketplace_orders o ON o.id = oi."orderId" WHERE oi."sellerId" = ${sellerId} AND o."orderStatus" = 'delivered' AND o."paymentStatus" = 'paid') AS "completedOrders",
      (SELECT COALESCE(sum(oi.quantity * oi."unitPrice"), 0)::numeric FROM marketplace_order_items oi JOIN marketplace_orders o ON o.id = oi."orderId" WHERE oi."sellerId" = ${sellerId} AND o."paymentStatus" = 'paid') AS revenue,
      (SELECT count(*)::int FROM inquiries WHERE "sellerId" = ${sellerId}) AS inquiries
  `)

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

  const rows = (value: unknown) => (value as { rows?: Record<string, unknown>[] }).rows ?? []
  return NextResponse.json({
    summary: rows(summaryResult)[0] ?? { totalProducts: 0, published: 0, pendingOrders: 0, completedOrders: 0, revenue: 0, inquiries: 0 },
    recentOrders: rows(ordersResult),
    topProducts: rows(productsResult),
  })
}
