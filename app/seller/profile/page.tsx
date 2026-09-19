import Link from 'next/link'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'

export default async function SellerProfilePage() {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') redirect('/auth?role=seller')
  let profile: Record<string, unknown> = {}
  if (hasDatabaseConnection()) {
    try { const result = await db.execute(sql`SELECT "shopName", bio, address, phone, state FROM seller_profiles WHERE "userId" = ${session.user.id} LIMIT 1`); profile = (result as { rows?: Record<string, unknown>[] }).rows?.[0] ?? {} } catch { profile = {} }
  }
    const initial = {
      shopName: String(profile.shopName ?? ''),
      state: String(profile.state ?? ''),
      bio: String(profile.bio ?? ''),
      address: String(profile.address ?? ''),
      phone: String(profile.phone ?? ''),
    }
    return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] sm:px-8 lg:px-12"><div className="mx-auto max-w-3xl"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">Back to seller studio</Link><p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Seller profile</p><h1 className="mt-2 font-serif text-5xl">Your artisan identity.</h1><section className="mt-10 rounded-[2rem] border border-[#e4ded2] bg-white p-8"><p className="text-sm text-[#65756c]">Account</p><h2 className="mt-2 font-serif text-3xl">{session.user.name}</h2><p className="mt-1 text-sm text-[#65756c]">{session.user.email}</p><SellerProfileForm initial={initial} /></section></div></main>
}
