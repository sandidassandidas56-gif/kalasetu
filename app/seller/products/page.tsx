import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'

export default async function SellerProductsPage() {
  const session = await getCurrentSession()
  if (!session) redirect('/auth?role=seller')
  const rows = !hasDatabaseConnection() ? [] : ((await db.execute(sql`SELECT p.id, p.name, p.category, p.price, p.availability, p.published FROM products p JOIN seller_profiles s ON s.id = p."sellerId" WHERE s."userId" = ${session.user.id} ORDER BY p."createdAt" DESC`)) as unknown as { rows?: Record<string, unknown>[] }).rows ?? []
  return <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#17251f] lg:px-10"><div className="mx-auto max-w-5xl"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">Back to studio</Link><div className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Catalog</p><h1 className="mt-2 font-serif text-5xl">Your products</h1></div><Link href="/seller/add-product" className="rounded-full bg-[#20342b] px-5 py-3 text-sm font-semibold text-white">Add product</Link></div>{rows.length === 0 ? <section className="mt-10 rounded-3xl border border-dashed border-[#cfc7b9] bg-white p-12 text-center"><h2 className="font-serif text-3xl">Your catalog is waiting</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68766d]">Products published from Add Product will appear here with their real availability and publication state.</p></section> : <div className="mt-10 grid gap-4 sm:grid-cols-2">{rows.map(row => <article key={String(row.id)} className="rounded-3xl border border-[#ddd5c7] bg-white p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl">{String(row.name)}</h2><p className="mt-1 text-sm text-[#68766d]">{String(row.category || 'Uncategorized')}</p></div><span className="rounded-full bg-[#eef4ed] px-3 py-1 text-xs font-bold">{row.published ? 'Published' : 'Draft'}</span></div><p className="mt-6 text-lg font-semibold">₹{Number(row.price).toLocaleString('en-IN')}</p><p className="mt-2 text-xs text-[#68766d]">Availability: {String(row.availability)}</p></article>)}</div>}</div></main>
}
