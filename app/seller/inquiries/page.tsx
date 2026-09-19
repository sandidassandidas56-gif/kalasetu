import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth'
import { SellerInquiries } from '@/components/seller-inquiries'

export default async function SellerInquiriesPage() {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') redirect('/auth?role=seller')
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] sm:px-8 lg:px-12"><div className="mx-auto max-w-4xl"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">Back to seller studio</Link><p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Buyer inquiries</p><h1 className="mt-2 font-serif text-5xl">Conversations with buyers.</h1><p className="mt-3 text-[#65756c]">Answer questions about your products and keep buyers informed.</p><section className="mt-10"><SellerInquiries /></section></div></main>
}
