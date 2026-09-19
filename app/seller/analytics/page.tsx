import Link from 'next/link'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, ensureMarketplaceSchema, hasDatabaseConnection } from '@/lib/db'

export default async function SellerAnalyticsPage() {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') redirect('/auth?role=seller')
  let totalProducts = 0
  let published = 0
  let averagePrice = 0
  if (hasDatabaseConnection()) {
    await ensureMarketplaceSchema()
    const result = await db.execute(sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE published = true)::int AS published, COALESCE(avg(price), 0)::numeric AS average FROM products WHERE "sellerId" = ${session.user.id}`)
    const row = (result as { rows?: { total?: number; published?: number; average?: number }[] }).rows?.[0]
    totalProducts = Number(row?.total ?? 0)
    published = Number(row?.published ?? 0)
    averagePrice = Number(row?.average ?? 0)
  }
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] sm:px-8 lg:px-12"><div className="mx-auto max-w-5xl"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">Back to seller studio</Link><p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Seller analytics</p><h1 className="mt-2 font-serif text-5xl">Your real catalog signals.</h1><p className="mt-3 max-w-xl text-[#65756c]">Sales, traffic, and conversion metrics will appear after marketplace events are recorded. Catalog metrics below are live.</p><section className="mt-10 grid gap-4 sm:grid-cols-3">{[{ label: 'Catalog items', value: totalProducts }, { label: 'Published items', value: published }, { label: 'Average price', value: averagePrice ? `₹${averagePrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0' }].map(metric => <div key={metric.label} className="rounded-3xl border border-[#e4ded2] bg-white p-6"><p className="text-sm text-[#65756c]">{metric.label}</p><p className="mt-5 font-serif text-4xl">{metric.value}</p><p className="mt-2 text-xs text-[#89948d]">Live from your catalog</p></div>)}</section><section className="mt-10 rounded-[2rem] border border-dashed border-[#cfc7b9] bg-white p-10 text-center"><h2 className="font-serif text-3xl">Marketplace analytics will grow here.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#65756c]">Views, saves, inquiries, and conversion rates are not fabricated. They will appear when real buyer events are recorded.</p></section></div></main>
}
