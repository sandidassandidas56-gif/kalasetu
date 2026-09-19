'use client'

import { useEffect, useState } from 'react'

type Notification = { id: string; title: string; body: string; createdAt: string }

export function SellerNotificationPopover() {
  const [latest, setLatest] = useState<Notification | null>(null)
  const [seen, setSeen] = useState<string | null>(null)

  async function check() {
    const response = await fetch('/api/notifications', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json() as { notifications?: Notification[] }
    const notification = data.notifications?.[0]
    if (notification && seen && notification.id !== seen) setLatest(notification)
    if (notification && !seen) setSeen(notification.id)
  }

  useEffect(() => {
    void check()
    const timer = window.setInterval(() => void check(), 15000)
    return () => window.clearInterval(timer)
  }, [seen])

  if (!latest) return null
  return <div className="fixed right-5 top-5 z-50 w-[min(24rem,calc(100vw-2.5rem))] rounded-2xl border border-[#d8d1c4] bg-white p-4 shadow-xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9704b]">New notification</p><p className="mt-1 font-semibold text-[#20342b]">{latest.title}</p><p className="mt-1 text-sm leading-5 text-[#65756c]">{latest.body}</p></div><button type="button" onClick={() => setLatest(null)} aria-label="Dismiss notification" className="text-lg leading-none text-[#65756c]">×</button></div></div>
}
