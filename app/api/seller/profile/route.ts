import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, ensureMarketplaceSchema, hasDatabaseConnection } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
  if (!hasDatabaseConnection()) return NextResponse.json({ error: 'Database connection is not configured' }, { status: 503 })

  const body = await request.json() as Record<string, unknown>
  const shopName = String(body.shopName ?? '').trim()
  const state = String(body.state ?? '').trim()
  if (!shopName || !state) return NextResponse.json({ error: 'Shop name and state are required' }, { status: 400 })

  await ensureMarketplaceSchema()
  await db.execute(sql`INSERT INTO seller_profiles (id, "userId", "shopName", state, bio, address, phone) VALUES (${crypto.randomUUID()}, ${session.user.id}, ${shopName}, ${state}, ${String(body.bio ?? '').trim()}, ${String(body.address ?? '').trim()}, ${String(body.phone ?? '').trim()}) ON CONFLICT ("userId") DO UPDATE SET "shopName" = EXCLUDED."shopName", state = EXCLUDED.state, bio = EXCLUDED.bio, address = EXCLUDED.address, phone = EXCLUDED.phone, "updatedAt" = now()`)
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
