import Link from 'next/link'
import { headers } from 'next/headers'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function SellerNotificationsPage() {
  const session = await getCurrentSession()
  if (!session?.user) return <main className="p-10">Please <Link href="/auth?role=seller" className="font-semibold text-[#d9704b]">sign in</Link> to view notifications.</main>
  let result: { rows?: { title: string; body: string; createdAt: string }[] } = { rows: [] }
  try { result = !hasDatabaseConnection() ? { rows: [] } : await db.execute(sql`SELECT title, body, "createdAt" FROM notifications WHERE "userId" = ${session.user.id} ORDER BY "createdAt" DESC LIMIT 50`) as typeof result } catch { result = { rows: [] } }
  const rows = (result as unknown as { rows?: { title: string; body: string; createdAt: string }[] }).rows ?? []
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] lg:px-10"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">Back to seller studio</Link><h1 className="mt-6 font-serif text-4xl">Notifications</h1><section className="mt-8 max-w-3xl space-y-3">{rows.length ? rows.map(row => <article key={`${row.createdAt}-${row.title}`} className="rounded-2xl bg-white p-5"><p className="font-semibold">{row.title}</p><p className="mt-1 text-sm text-[#68766d]">{row.body}</p></article>) : <div className="rounded-3xl border border-dashed border-[#cfc7b9] bg-white p-10 text-center text-[#68766d]">No notifications yet. Buyer inquiries and order updates will appear here.</div>}</section></main>
}
