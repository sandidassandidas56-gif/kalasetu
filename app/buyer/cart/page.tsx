import Link from 'next/link'
import { getBuyerCart } from '@/app/actions/commerce'
import { CartCheckout } from '@/components/cart-checkout'

export default async function CartPage() {
  let items: Awaited<ReturnType<typeof getBuyerCart>> = []
  let error = ''
  try { items = await getBuyerCart() } catch (caught) { error = caught instanceof Error ? caught.message : 'Buyer access required' }
  return <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#17251f] lg:px-12"><Link href="/buyer" className="text-sm font-semibold text-[#d9704b]">← Continue shopping</Link><div className="mx-auto mt-10 max-w-6xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9704b]">Buyer checkout</p><h1 className="mt-2 font-serif text-5xl">Your cart.</h1>{error ? <div className="mt-8 rounded-[2rem] border border-dashed border-[#cfc7b9] bg-white p-8"><p className="font-serif text-2xl">Sign in as a buyer to view your cart.</p><p className="mt-2 text-sm text-[#68766d]">Your cart is private to your KalaSetu account.</p><Link href="/auth?role=buyer" className="mt-6 inline-flex rounded-full bg-[#1e503e] px-5 py-3 text-sm font-bold text-white">Buyer sign in</Link></div> : <CartCheckout items={items as never} />}</div></main>
}
