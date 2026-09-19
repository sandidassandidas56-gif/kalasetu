import Link from 'next/link'
import { getBuyerOrders } from '@/app/actions/commerce'

export default async function BuyerOrdersPage() {
  let orders: Record<string, unknown>[] = []
  try { orders = await getBuyerOrders() } catch {}
  return <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#17251f] lg:px-12"><Link href="/buyer" className="text-sm font-semibold text-[#d9704b]">← Buyer workspace</Link><div className="mx-auto mt-10 max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9704b]">Orders</p><h1 className="mt-2 font-serif text-5xl">Your orders.</h1><div className="mt-8 space-y-3">{orders.length ? orders.map(order => <article key={String(order.id)} className="rounded-2xl border border-[#d8d1c4] bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><strong>Order {String(order.id).slice(0, 8)}</strong><span className="rounded-full bg-[#f7eadf] px-3 py-1 text-xs font-bold">{String(order.orderStatus)}</span></div><p className="mt-3 text-sm text-[#68766d]">Total ₹{Number(order.total).toLocaleString('en-IN')} · {String(order.paymentMethod ?? 'order_request')} · Payment {String(order.paymentStatus)}</p><p className="mt-2 text-xs text-[#68766d]">{String(order.shippingAddress)}</p></article>) : <div className="rounded-[2rem] border border-dashed border-[#cfc7b9] bg-white p-8"><p className="font-serif text-2xl">No orders yet.</p><p className="mt-2 text-sm text-[#68766d]">Orders appear here after you create an order request from your cart.</p></div>}</div></div></main>
}
