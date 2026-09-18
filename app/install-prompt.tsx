'use client'

import { useEffect, useState } from 'react'

export function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler as EventListener)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener)
    }
  }, [])

  if (!isVisible || !deferredPrompt) return null

  const install = async () => {
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setIsVisible(false)
    setDeferredPrompt(null)
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-[#d8d1c4] bg-[#1e503e] p-4 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#dfeae4]">Install app</p>
          <p className="mt-1 text-sm font-semibold">Add KalaSetu to your home screen</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsVisible(false)} className="rounded-full border border-white/30 px-3 py-2 text-xs font-semibold">Later</button>
          <button onClick={install} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#1e503e]">Install</button>
        </div>
      </div>
    </div>
  )
}
