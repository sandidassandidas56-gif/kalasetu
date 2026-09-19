import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, ensureMarketplaceSchema, hasDatabaseConnection } from '@/lib/db'
import { getDemoSellerDashboard } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

const emptyDashboard = {
  summary: { totalProducts: 0, published: 0, pendingOrders: 0, completedOrders: 0, revenue: 0, inquiries: 0 },
  recentOrders: [],
  topProducts: [],
}

const fallbackDashboard = getDemoSellerDashboard()

const rows = (value: unknown) => (value as { rows?: Record<string, unknown>[] }).rows ?? []

export async function GET() {
  try {
    const session = await getCurrentSession()
    const role = (session?.user as { role?: string } | undefined)?.role
    if (!session?.user || role !== 'seller') return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
    if (!hasDatabaseConnection()) return NextResponse.json(fallbackDashboard)
    await ensureMarketplaceSchema()

    const sellerId = session.user.id

    const [productsSummary, ordersSummary, recentOrdersResult, topProductsResult, inquiriesResult] = await Promise.all([
      db.execute(sql`
        SELECT COUNT(*)::int AS "totalProducts",
               COUNT(*) FILTER (WHERE published = true)::int AS published
        FROM products
        WHERE "sellerId" = ${sellerId}
      `),
      db.execute(sql`
        SELECT
          COALESCE(SUM(CASE WHEN "paymentStatus" = 'paid' AND "orderStatus" NOT IN ('delivered', 'cancelled') THEN 1 ELSE 0 END), 0)::int AS "pendingOrders",
          COALESCE(SUM(CASE WHEN "paymentStatus" = 'paid' AND "orderStatus" = 'delivered' THEN 1 ELSE 0 END), 0)::int AS "completedOrders",
          COALESCE(SUM(CASE WHEN "paymentStatus" = 'paid' THEN total ELSE 0 END), 0)::numeric AS revenue
        FROM marketplace_orders o
        WHERE EXISTS (
          SELECT 1 FROM marketplace_order_items moi WHERE moi."orderId" = o.id AND moi."sellerId" = ${sellerId}
        )
      `),
      db.execute(sql`
        SELECT o.id AS "orderId",
               u.name AS buyer,
               p.name AS item,
               (moi.quantity * moi."unitPrice")::numeric AS amount,
               o."orderStatus" AS status
        FROM marketplace_orders o
        JOIN marketplace_order_items moi ON moi."orderId" = o.id
        JOIN products p ON p.id = moi."productId"
        JOIN "user" u ON u.id = o."buyerId"
        WHERE moi."sellerId" = ${sellerId}
        ORDER BY o."createdAt" DESC
        LIMIT 5
      `),
      db.execute(sql`
        SELECT p.name,
               COALESCE(SUM(CASE WHEN o."paymentStatus" = 'paid' THEN moi.quantity ELSE 0 END), 0)::int AS sales,
               COALESCE(SUM(CASE WHEN o."paymentStatus" = 'paid' THEN moi.quantity * moi."unitPrice" ELSE 0 END), 0)::numeric AS revenue
        FROM products p
        LEFT JOIN marketplace_order_items moi ON moi."productId" = p.id
        LEFT JOIN marketplace_orders o ON o.id = moi."orderId"
        WHERE p."sellerId" = ${sellerId}
        GROUP BY p.id, p.name
        ORDER BY sales DESC, revenue DESC
        LIMIT 5
      `),
      db.execute(sql`
        SELECT COUNT(*)::int AS inquiries
        FROM inquiries
        WHERE "sellerId" = ${sellerId}
      `),
    ])

    const summary = rows(productsSummary)[0] ?? emptyDashboard.summary
    const orderSummary = rows(ordersSummary)[0] ?? emptyDashboard.summary
    const inquiryCount = Number(rows(inquiriesResult)[0]?.inquiries ?? 0)
    const dashboard = {
      summary: {
        totalProducts: Number(summary.totalProducts ?? 0),
        published: Number(summary.published ?? 0),
        pendingOrders: Number(orderSummary.pendingOrders ?? 0),
        completedOrders: Number(orderSummary.completedOrders ?? 0),
        revenue: Number(orderSummary.revenue ?? 0),
        inquiries: inquiryCount,
      },
      recentOrders: rows(recentOrdersResult).map((row) => ({
        orderId: String(row.orderId),
        buyer: String(row.buyer ?? 'Buyer'),
        item: String(row.item ?? 'Product'),
        amount: Number(row.amount ?? 0),
        status: String(row.status ?? 'pending'),
      })),
      topProducts: rows(topProductsResult).map((row) => ({
        name: String(row.name ?? 'Product'),
        sales: Number(row.sales ?? 0),
        revenue: Number(row.revenue ?? 0),
      })),
    }

    if (!dashboard.summary.totalProducts && !dashboard.summary.published && !dashboard.recentOrders.length && !dashboard.topProducts.length) {
      return NextResponse.json(fallbackDashboard)
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('SELLER DASHBOARD FAILED', { error: error instanceof Error ? error.message : 'unknown error' })
    return NextResponse.json({ ...emptyDashboard, error: 'Seller dashboard data is temporarily unavailable.' }, { status: 503 })
  }
}
