'use client'

import { useTransition } from 'react'
import { updateSellerOrderStatus, statuses } from '@/app/actions/orders'

export function OrderStatusForm({ orderId, current }: { orderId: string; current: string }) {
  const [pending, startTransition] = useTransition()
  return <select aria-label="Update order status" defaultValue={current} disabled={pending} onChange={event => startTransition(() => updateSellerOrderStatus(orderId, event.target.value))} className="rounded-lg border border-[#d8d1c4] bg-[#f7f3ec] px-3 py-2 text-xs font-semibold"><option value={current}>{current}</option>{statuses.filter(status => status !== current).map(status => <option key={status} value={status}>{status}</option>)}</select>
}
