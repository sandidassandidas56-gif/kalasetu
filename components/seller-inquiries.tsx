'use client'

import { useEffect, useState } from 'react'

type Inquiry = { id: string; subject: string; message: string; status: string; sellerResponse?: string; buyerName?: string; productName?: string; createdAt: string }

export function SellerInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('Loading inquiries...')

  async function load() {
    const response = await fetch('/api/seller/inquiries', { cache: 'no-store' })
    const data = await response.json() as { inquiries?: Inquiry[]; error?: string }
    if (!response.ok) throw new Error(data.error || 'Unable to load inquiries')
    setInquiries(data.inquiries ?? [])
    setMessage('')
  }

  useEffect(() => { void load().catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load inquiries')) }, [])

  async function respond(inquiryId: string) {
    const responseText = responses[inquiryId]?.trim()
    if (!responseText) return
    const response = await fetch('/api/seller/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inquiryId, response: responseText }) })
    const data = await response.json() as { error?: string }
    if (!response.ok) return setMessage(data.error || 'Unable to send response')
    setResponses((current) => ({ ...current, [inquiryId]: '' }))
    await load()
  }

  if (message && !inquiries.length) return <p className="rounded-2xl border border-dashed border-[#cfc7b9] bg-white p-8 text-sm text-[#65756c]">{message}</p>
  if (!inquiries.length) return <p className="rounded-2xl border border-dashed border-[#cfc7b9] bg-white p-8 text-sm text-[#65756c]">No buyer inquiries yet.</p>
  return <div className="space-y-4">{inquiries.map((inquiry) => <article key={inquiry.id} className="rounded-2xl border border-[#d8d1c4] bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9704b]">{inquiry.productName || 'Product inquiry'}</p><h2 className="mt-1 font-serif text-2xl">{inquiry.subject}</h2></div><span className="rounded-full bg-[#eef4ed] px-3 py-1 text-xs font-bold">{inquiry.status}</span></div><p className="mt-3 text-sm text-[#65756c]">From {inquiry.buyerName || 'Buyer'}</p><p className="mt-4 leading-6">{inquiry.message}</p>{inquiry.sellerResponse ? <p className="mt-4 rounded-xl bg-[#f7f5ef] p-4 text-sm"><strong>Your response:</strong> {inquiry.sellerResponse}</p> : <div className="mt-5 flex gap-3"><textarea value={responses[inquiry.id] ?? ''} onChange={(event) => setResponses((current) => ({ ...current, [inquiry.id]: event.target.value }))} placeholder="Write a helpful response" className="min-h-20 flex-1 rounded-xl border border-[#d8d1c4] p-3 text-sm" /><button onClick={() => void respond(inquiry.id)} className="self-end rounded-full bg-[#20342b] px-4 py-2 text-sm font-bold text-white">Respond</button></div>}</article>)}</div>
}
