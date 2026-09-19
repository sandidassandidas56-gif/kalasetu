import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, ensureMarketplaceSchema, hasDatabaseConnection } from '@/lib/db'

const emptyDashboard = {
  summary: { totalProducts: 0, published: 0, pendingOrders: 0, completedOrders: 0, revenue: 0, inquiries: 0 },
  recentOrders: [],
  topProducts: [],
}

const rows = (value: unknown) => (value as { rows?: Record<string, unknown>[] }).rows ?? []

export async function GET() {
  try {
    const session = await getCurrentSession()
    const role = (session?.user as { role?: string } | undefined)?.role
    if (!session?.user || role !== 'seller') return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
    if (!hasDatabaseConnection()) return NextResponse.json(emptyDashboard)
    await ensureMarketplaceSchema()

    const sellerId = session.user.id
    const summaryResult = await db.execute(sql`
      SELECT count(*)::int AS "totalProducts", count(*) FILTER (WHERE published = true)::int AS published
      FROM products WHERE "sellerId" = ${sellerId}
    `)
    const productsResult = await db.execute(sql`
      SELECT name, 0::int AS sales, 0::numeric AS revenue
      FROM products WHERE "sellerId" = ${sellerId}
      ORDER BY "createdAt" DESC LIMIT 5
    `)

    return NextResponse.json({
      summary: { ...(rows(summaryResult)[0] ?? emptyDashboard.summary), pendingOrders: 0, completedOrders: 0, revenue: 0, inquiries: 0 },
      recentOrders: [],
      topProducts: rows(productsResult),
    })
  } catch (error) {
    console.error('SELLER DASHBOARD FAILED', { error: error instanceof Error ? error.message : 'unknown error' })
    return NextResponse.json({ ...emptyDashboard, error: 'Seller dashboard data is temporarily unavailable.' }, { status: 503 })
  }
}
