import Link from 'next/link'
import { headers } from 'next/headers'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function SellerMessagesPage() {
  const session = await getCurrentSession()
  if (!session?.user) return <main className="p-10">Please <Link href="/auth?role=seller" className="font-semibold text-[#d9704b]">sign in</Link> to view messages.</main>
  const result = !hasDatabaseConnection() ? { rows: [] } : await db.execute(sql`SELECT m.body, m."createdAt", COALESCE(u.name, 'Buyer') AS sender_name FROM messages m LEFT JOIN "user" u ON u.id = m."senderId" WHERE m."recipientId" = ${session.user.id} ORDER BY m."createdAt" DESC LIMIT 50`)
  const rows = (result as unknown as { rows?: { body: string; createdAt: string; sender_name: string }[] }).rows ?? []
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] lg:px-10"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">Back to seller studio</Link><h1 className="mt-6 font-serif text-4xl">Messages</h1><p className="mt-3 text-[#68766d]">Respond to buyers who are considering your work.</p><section className="mt-8 max-w-3xl space-y-3">{rows.length ? rows.map(row => <article key={`${row.createdAt}-${row.body}`} className="rounded-2xl bg-white p-5"><div className="flex justify-between gap-4"><strong>{row.sender_name}</strong><time className="text-xs text-[#68766d]">{new Date(row.createdAt).toLocaleDateString('en-IN')}</time></div><p className="mt-2 text-sm leading-6 text-[#68766d]">{row.body}</p></article>) : <div className="rounded-3xl border border-dashed border-[#cfc7b9] bg-white p-10 text-center text-[#68766d]">No buyer conversations yet. New product inquiries will appear here.</div>}</section></main>
}
