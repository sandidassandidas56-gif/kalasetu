import Link from 'next/link'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'

export default async function BuyerInquiriesPage() {
  const session = await getCurrentSession()
  const rows = session?.user ? (!hasDatabaseConnection() ? [] : ((await db.execute(sql`SELECT id, subject, message, status, "createdAt" FROM inquiries WHERE "buyerId" = ${session.user.id} ORDER BY "createdAt" DESC`)) as unknown as { rows?: Record<string, unknown>[] }).rows ?? []) : []
  return <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#17251f] lg:px-12"><Link href="/buyer" className="text-sm font-semibold text-[#d9704b]">← Buyer workspace</Link><div className="mx-auto mt-10 max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9704b]">Inquiries</p><h1 className="mt-2 font-serif text-5xl">Questions for artisans.</h1><div className="mt-8 space-y-3">{rows.length ? rows.map(row => <article key={String(row.id)} className="rounded-2xl border border-[#d8d1c4] bg-white p-5"><div className="flex justify-between gap-3"><strong>{String(row.subject)}</strong><span className="text-xs font-bold uppercase text-[#d9704b]">{String(row.status)}</span></div><p className="mt-3 text-sm text-[#68766d]">{String(row.message)}</p></article>) : <div className="rounded-[2rem] border border-dashed border-[#cfc7b9] bg-white p-8"><p className="font-serif text-2xl">No inquiries yet.</p><p className="mt-2 text-sm text-[#68766d]">Use “Contact seller” on a product to start a conversation.</p></div>}</div></div></main>
}
