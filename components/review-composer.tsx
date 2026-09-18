'use client'

import { useState } from 'react'
import { createReview } from '@/app/actions/reviews'

export function ReviewComposer({ productId }: { productId: string }) {
  const [body, setBody] = useState('')
  const [rating, setRating] = useState('5')
  const [status, setStatus] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try { await createReview({ productId, rating: Number(rating), body }); setStatus('Review saved.'); setBody('') } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to save review.') }
  }
  return <form onSubmit={submit} className="mt-8 rounded-3xl border border-[#ddd5c7] bg-white p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#d9704b]">Share your experience</p><div className="mt-4 flex gap-2"><label className="sr-only" htmlFor="rating">Rating</label><select id="rating" value={rating} onChange={event => setRating(event.target.value)} className="rounded-xl border border-[#d8d1c4] bg-[#f7f3ec] px-3 py-2 text-sm"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></div><label className="sr-only" htmlFor="review-body">Review</label><textarea id="review-body" required value={body} onChange={event => setBody(event.target.value)} className="mt-3 min-h-24 w-full rounded-2xl border border-[#d8d1c4] p-3 text-sm outline-none focus:border-[#d9704b]" placeholder="What did you notice about the craft?" /><button className="mt-3 rounded-full bg-[#20342b] px-5 py-3 text-sm font-semibold text-white">Save review</button>{status && <p className="mt-3 text-sm text-[#68766d]">{status}</p>}</form>
}
