'use client'

import { useState } from 'react'
import { createInquiry } from '@/app/actions/inquiries'

export function InquiryComposer({ sellerId, productId }: { sellerId: string; productId?: string }) {
  const [subject, setSubject] = useState('Question about this craft')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  async function submit() { setStatus('sending'); try { await createInquiry({ sellerId, productId, subject, message }); setStatus('Inquiry sent to the artisan.') } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not send inquiry') } }
  return <div className="mt-8 rounded-2xl border border-[#d8d1c4] bg-white p-5"><p className="font-serif text-2xl">Ask the artisan</p><input value={subject} onChange={event => setSubject(event.target.value)} className="mt-4 w-full rounded-xl border border-[#d8d1c4] p-3 text-sm" /><textarea value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask about materials, sizing, or custom work" className="mt-3 min-h-24 w-full rounded-xl border border-[#d8d1c4] p-3 text-sm" /><button onClick={submit} disabled={!message.trim() || status === 'sending'} className="mt-3 rounded-full bg-[#1e503e] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Send inquiry</button>{status && <p className="mt-3 text-sm text-[#68766d]">{status}</p>}</div>
}
