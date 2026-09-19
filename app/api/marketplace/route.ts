import { NextResponse } from 'next/server'
import { db, ensureMarketplaceSchema, hasDatabaseConnection } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { getDemoMarketplaceData } from '@/lib/demo-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')?.trim() || ''
  const query = searchParams.get('q')?.trim() || ''

  if (!hasDatabaseConnection()) {
    const demo = getDemoMarketplaceData(state, query)
    return NextResponse.json({
      products: demo.products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: String(product.price),
        imageUrl: product.imageUrl,
        state: product.state,
        availability: product.availability,
        shopName: product.shopName,
        avatarUrl: product.avatarUrl,
        bio: product.bio,
        sellerName: product.sellerName,
      })),
      sellers: demo.sellers.map((seller) => ({
        id: seller.id,
        shopName: seller.shopName,
        avatarUrl: seller.avatarUrl,
        bio: seller.bio,
        address: seller.address,
        state: seller.state,
        sellerName: seller.sellerName,
        productCount: seller.productCount,
      })),
      state: state || null,
    })
  }

  await ensureMarketplaceSchema()
  const productFilters = [sql`p.published = true`]
  if (state) productFilters.push(sql`lower(p.state) = lower(${state})`)
  if (query) productFilters.push(sql`(p.name ILIKE ${`%${query}%`} OR p.category ILIKE ${`%${query}%`})`)
  const products = await db.execute(sql`SELECT p.id, p.name, p.description, p.category, p.price, p."imageUrl", p.state, p.availability, sp."shopName", sp."avatarUrl", sp.bio, u.name AS "sellerName" FROM products p LEFT JOIN seller_profiles sp ON sp."userId" = p."sellerId" LEFT JOIN "user" u ON u.id = p."sellerId" WHERE ${sql.join(productFilters, sql` AND `)} ORDER BY p."createdAt" DESC`)
  const sellerStateFilter = state ? sql`AND lower(COALESCE(NULLIF(sp.state, ''), p.state)) = lower(${state})` : sql``
  const sellers = await db.execute(sql`SELECT p."sellerId" AS id, COALESCE(NULLIF(sp."shopName", ''), u.name) AS "shopName", sp."avatarUrl", sp.bio, sp.address, COALESCE(NULLIF(sp.state, ''), p.state) AS state, u.name AS "sellerName", count(p.id)::int AS "productCount" FROM products p LEFT JOIN seller_profiles sp ON sp."userId" = p."sellerId" LEFT JOIN "user" u ON u.id = p."sellerId" WHERE p.published = true ${sellerStateFilter} GROUP BY p."sellerId", sp."shopName", sp."avatarUrl", sp.bio, sp.address, sp.state, p.state, u.name ORDER BY "productCount" DESC, "sellerName"`)
  return NextResponse.json({ products: products.rows, sellers: sellers.rows, state: state || null }, { headers: { 'Cache-Control': 'no-store' } })
}
