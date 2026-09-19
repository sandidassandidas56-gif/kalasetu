import Link from 'next/link'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { saveSellerProfile } from '@/app/actions/profile'

export default async function SellerProfilePage() {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') redirect('/auth?role=seller')
  let profile: Record<string, unknown> = {}
  if (hasDatabaseConnection()) {
    try { const result = await db.execute(sql`SELECT "shopName", bio, address, phone, state FROM seller_profiles WHERE "userId" = ${session.user.id} LIMIT 1`); profile = (result as { rows?: Record<string, unknown>[] }).rows?.[0] ?? {} } catch { profile = {} }
  }
    return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] sm:px-8 lg:px-12"><div className="mx-auto max-w-3xl"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">Back to seller studio</Link><p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Seller profile</p><h1 className="mt-2 font-serif text-5xl">Your artisan identity.</h1><section className="mt-10 rounded-[2rem] border border-[#e4ded2] bg-white p-8"><p className="text-sm text-[#65756c]">Account</p><h2 className="mt-2 font-serif text-3xl">{session.user.name}</h2><p className="mt-1 text-sm text-[#65756c]">{session.user.email}</p><form action={saveSellerProfile} className="mt-8 grid gap-5 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-semibold">Shop name<input name="shopName" defaultValue={String(profile.shopName ?? '')} required className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label><label className="flex flex-col gap-2 text-sm font-semibold">State<input name="state" defaultValue={String(profile.state ?? '')} required className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label><label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">Bio<textarea name="bio" defaultValue={String(profile.bio ?? '')} rows={4} className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Address<textarea name="address" defaultValue={String(profile.address ?? '')} rows={3} className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Phone<input name="phone" defaultValue={String(profile.phone ?? '')} inputMode="tel" className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label><button type="submit" className="w-fit rounded-full bg-[#20342b] px-5 py-3 text-sm font-bold text-white">Save profile</button></form></section></div></main>
}
