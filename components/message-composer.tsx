'use client'

import { useState } from 'react'
import { sendMessage } from '@/app/actions/messages'

export function MessageComposer({ recipientId }: { recipientId: string }) {
  const [body, setBody] = useState(''); const [status, setStatus] = useState('')
  return <form action={async () => { try { await sendMessage({ recipientId, body }); setBody(''); setStatus('Message sent.')} catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to send message.')} }} className="rounded-2xl bg-white p-5"><label className="text-sm font-semibold" htmlFor="message">Message</label><textarea id="message" value={body} onChange={e => setBody(e.target.value)} required rows={4} className="mt-3 w-full rounded-xl border border-[#d8d1c4] p-3 text-sm" placeholder="Write to the artisan" /><button className="mt-3 rounded-full bg-[#1e503e] px-5 py-2.5 text-sm font-bold text-white">Send message</button>{status && <p className="mt-3 text-sm text-[#68766d]">{status}</p>}</form>
}
