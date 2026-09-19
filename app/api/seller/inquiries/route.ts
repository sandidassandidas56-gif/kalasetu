import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, ensureMarketplaceSchema, hasDatabaseConnection } from '@/lib/db'

async function sellerSession() {
  const session = await getCurrentSession()
  return session?.user && (session.user as { role?: string }).role === 'seller' ? session : null
}

export async function GET() {
  const session = await sellerSession()
  if (!session) return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
  if (!hasDatabaseConnection()) return NextResponse.json({ inquiries: [] })
  await ensureMarketplaceSchema()
  const result = await db.execute(sql`SELECT i.id, i.subject, i.message, i.status, i."sellerResponse", i."createdAt", u.name AS "buyerName", p.name AS "productName" FROM inquiries i JOIN "user" u ON u.id = i."buyerId" LEFT JOIN products p ON p.id = i."productId" WHERE i."sellerId" = ${session.user.id} ORDER BY i."createdAt" DESC`)
  return NextResponse.json({ inquiries: result.rows }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const session = await sellerSession()
  if (!session) return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
  if (!hasDatabaseConnection()) return NextResponse.json({ error: 'Database connection is not configured' }, { status: 503 })
  const body = await request.json() as { inquiryId?: string; response?: string }
  const response = String(body.response ?? '').trim()
  if (!body.inquiryId || !response) return NextResponse.json({ error: 'A response is required' }, { status: 400 })
  await ensureMarketplaceSchema()
  const updated = await db.execute(sql`UPDATE inquiries SET "sellerResponse" = ${response}, status = 'answered', "respondedAt" = now(), "updatedAt" = now() WHERE id = ${body.inquiryId} AND "sellerId" = ${session.user.id} RETURNING "buyerId"`)
  const buyerId = (updated.rows as { buyerId?: string }[])[0]?.buyerId
  if (!buyerId) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  await db.execute(sql`INSERT INTO notifications (id, "userId", title, body) VALUES (${crypto.randomUUID()}, ${buyerId}, 'Seller replied', ${'The seller replied to your inquiry: ' + response})`)
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
