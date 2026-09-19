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
  const sellerFilters = [sql`true`]
  if (state) { productFilters.push(sql`lower(p.state) = lower(${state})`); sellerFilters.push(sql`lower(sp.state) = lower(${state})`) }
  if (query) productFilters.push(sql`(p.name ILIKE ${`%${query}%`} OR p.category ILIKE ${`%${query}%`})`)
  const products = await db.execute(sql`SELECT p.id, p.name, p.description, p.category, p.price, p."imageUrl", p.state, p.availability, sp."shopName", sp."avatarUrl", sp.bio, u.name AS "sellerName" FROM products p LEFT JOIN seller_profiles sp ON sp."userId" = p."sellerId" LEFT JOIN "user" u ON u.id = p."sellerId" WHERE ${sql.join(productFilters, sql` AND `)} ORDER BY p."createdAt" DESC`)
  const sellers = await db.execute(sql`SELECT sp."userId" AS id, sp."shopName", sp."avatarUrl", sp.bio, sp.address, sp.state, u.name AS "sellerName", count(p.id)::int AS "productCount" FROM seller_profiles sp LEFT JOIN "user" u ON u.id = sp."userId" LEFT JOIN products p ON p."sellerId" = sp."userId" AND p.published = true WHERE ${sql.join(sellerFilters, sql` AND `)} GROUP BY sp."userId", sp."shopName", sp."avatarUrl", sp.bio, sp.address, sp.state, u.name ORDER BY "productCount" DESC, "sellerName"`)
  return NextResponse.json({ products: products.rows, sellers: sellers.rows, state: state || null }, { headers: { 'Cache-Control': 'no-store' } })
}
