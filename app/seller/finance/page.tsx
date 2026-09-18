import Link from 'next/link'

export default function SellerFinancePage() {
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] sm:px-8 lg:px-12"><div className="mx-auto max-w-5xl"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">← Back to seller studio</Link><p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-[#d9704b]">Finance & invoices</p><h1 className="mt-2 font-serif text-5xl">Keep every rupee accounted for.</h1><p className="mt-3 max-w-xl text-[#65756c]">Payouts, invoices, platform fees, and tax documents will be generated from completed marketplace orders.</p><div className="mt-10 rounded-[2rem] border border-dashed border-[#cfc7b9] bg-white p-12 text-center"><p className="font-serif text-3xl">No finance records yet.</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#65756c]">Publish a product and complete an order to start your financial ledger.</p></div></div></main>
}
