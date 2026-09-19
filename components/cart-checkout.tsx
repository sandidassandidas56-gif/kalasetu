'use client'

import { useState } from 'react'
import { createCheckoutOrder } from '@/app/actions/commerce'

type CartItem = { id: string; name: string; quantity: number; price: number; availability: string; seller_name?: string }

export function CartCheckout({ items }: { items: CartItem[] }) {
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'order_request'>('cash_on_delivery')
  const [status, setStatus] = useState('')
  const total = items.filter(item => item.availability === 'available').reduce((sum, item) => sum + item.price * item.quantity, 0)
  async function checkout() {
    setStatus('processing')
    try { const result = await createCheckoutOrder(address, paymentMethod); setStatus(paymentMethod === 'cash_on_delivery' ? `Order ${result.id} created with Cash on Delivery. Payment is collected at delivery.` : `Order ${result.id} created as an order request. No payment was charged.`) }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Checkout failed. Please retry.') }
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
    <section className="rounded-[2rem] border border-[#d8d1c4] bg-white p-6">
      {items.length ? <div className="space-y-3">{items.map(item => <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#f7f3ec] p-4"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-[#68766d]">{item.seller_name || 'KalaSetu artisan'} · Qty {item.quantity}</p></div><p className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p></div>)}</div> : <p className="font-serif text-2xl">Your cart is empty.</p>}
    </section>
    <aside className="rounded-[2rem] border border-[#d8d1c4] bg-white p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d9704b]">Order summary</p><div className="mt-5 flex justify-between text-sm"><span>Subtotal</span><strong>₹{total.toLocaleString('en-IN')}</strong></div><p className="mt-2 text-xs text-[#68766d]">Choose how you want to pay. Online payments will be added when a provider is connected.</p><fieldset className="mt-5 space-y-3"><legend className="text-sm font-semibold">Payment method</legend><label className="flex items-start gap-3 rounded-xl border border-[#d8d1c4] p-3 text-sm"><input type="radio" name="paymentMethod" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setPaymentMethod('cash_on_delivery')} className="mt-1" /><span><strong>Cash on Delivery</strong><span className="block text-xs text-[#68766d]">Pay when your order arrives.</span></span></label><label className="flex items-start gap-3 rounded-xl border border-[#d8d1c4] p-3 text-sm"><input type="radio" name="paymentMethod" checked={paymentMethod === 'order_request'} onChange={() => setPaymentMethod('order_request')} className="mt-1" /><span><strong>Order request</strong><span className="block text-xs text-[#68766d]">Ask the seller to confirm before payment.</span></span></label></fieldset><label className="mt-6 flex flex-col gap-2 text-sm font-semibold">Shipping address<textarea value={address} onChange={event => setAddress(event.target.value)} className="min-h-24 rounded-xl border border-[#d8d1c4] p-3 font-normal" placeholder="House, street, city, state, PIN" /></label><button onClick={checkout} disabled={!items.length || !address.trim() || status === 'processing'} className="mt-5 w-full rounded-full bg-[#1e503e] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{status === 'processing' ? 'Creating order…' : paymentMethod === 'cash_on_delivery' ? 'Place COD order' : 'Create order request'}</button>{status && <p className="mt-4 rounded-xl bg-[#eef4ed] p-3 text-xs leading-5">{status}</p>}</aside>
  </div>
}
