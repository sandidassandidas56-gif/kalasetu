import Link from 'next/link'
import { getCurrentSession } from '@/lib/auth'
import { db, hasDatabaseConnection } from '@/lib/db'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { OrderStatusForm } from '@/components/order-status-form'

export default async function SellerOrdersPage() {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') return <main className="min-h-screen bg-[#f7f3ec] p-8"><Link href="/auth?role=seller">Seller sign in</Link></main>
  const result = !hasDatabaseConnection() ? { rows: [] } : await db.execute(sql`SELECT oi."orderId", oi.quantity, oi."unitPrice", p.name, o."orderStatus", o."paymentStatus", o."shippingAddress", o."createdAt" FROM marketplace_order_items oi JOIN products p ON p.id = oi."productId" JOIN marketplace_orders o ON o.id = oi."orderId" WHERE oi."sellerId" = ${session.user.id} ORDER BY o."createdAt" DESC`)
  const rows = (result as unknown as { rows?: Record<string, unknown>[] }).rows ?? []
  return <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-[#17251f] lg:px-12"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">← Seller workspace</Link><div className="mx-auto mt-10 max-w-5xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9704b]">Seller orders</p><h1 className="mt-2 font-serif text-5xl">Orders from your catalog.</h1><div className="mt-8 space-y-3">{rows.length ? rows.map(row => <article key={`${String(row.orderId)}-${String(row.name)}`} className="rounded-2xl border border-[#d8d1c4] bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><strong>{String(row.name)} · Qty {String(row.quantity)}</strong><OrderStatusForm orderId={String(row.orderId)} current={String(row.orderStatus)} /></div><p className="mt-3 text-sm text-[#68766d]">Payment {String(row.paymentStatus)} · ₹{(Number(row.unitPrice) * Number(row.quantity)).toLocaleString('en-IN')}</p><p className="mt-2 text-xs text-[#68766d]">Ship to: {String(row.shippingAddress)}</p></article>) : <div className="rounded-[2rem] border border-dashed border-[#cfc7b9] bg-white p-8"><p className="font-serif text-2xl">No seller orders yet.</p><p className="mt-2 text-sm text-[#68766d]">Published products will surface order requests here.</p></div>}</div></div></main>
}
