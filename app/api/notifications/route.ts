import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, ensureMarketplaceSchema, hasDatabaseConnection } from '@/lib/db'

export async function GET() {
  const session = await getCurrentSession()
  if (!session?.user) return NextResponse.json({ notifications: [] }, { status: 401 })
  if (!hasDatabaseConnection()) return NextResponse.json({ notifications: [] })
  await ensureMarketplaceSchema()
  const result = await db.execute(sql`SELECT id, title, body, "createdAt" FROM notifications WHERE "userId" = ${session.user.id} ORDER BY "createdAt" DESC LIMIT 10`)
  return NextResponse.json({ notifications: result.rows }, { headers: { 'Cache-Control': 'no-store' } })
}
