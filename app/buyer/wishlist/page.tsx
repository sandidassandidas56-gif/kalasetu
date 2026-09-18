import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth'

export default async function WishlistPage() {
  const session = await getCurrentSession()
  if (!session) redirect('/auth?role=buyer')
  return <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#17251f]"><Link href="/buyer" className="text-sm font-semibold text-[#d9704b]">Back to marketplace</Link><h1 className="mt-7 font-serif text-5xl">Wishlist</h1><section className="mt-10 max-w-2xl rounded-3xl border border-dashed border-[#cfc7b9] bg-white p-12 text-center"><h2 className="font-serif text-3xl">Nothing saved yet</h2><p className="mt-3 text-sm leading-6 text-[#68766d]">Save products from the marketplace and they will appear here for your next visit.</p><Link href="/buyer" className="mt-6 inline-flex rounded-full bg-[#20342b] px-5 py-3 text-sm font-semibold text-white">Explore marketplace</Link></section></main>
}
