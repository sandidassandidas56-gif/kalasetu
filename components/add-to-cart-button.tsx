'use client'
import { useState } from 'react'
import { addToCart } from '@/app/actions/commerce'

export function AddToCartButton({ productId }: { productId: string }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  return <button onClick={async () => { setState('saving'); try { await addToCart(productId); setState('saved') } catch { setState('error') } }} disabled={state === 'saving'} className="rounded-full bg-[#d9704b] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{state === 'saving' ? 'Adding…' : state === 'saved' ? 'Added to cart' : state === 'error' ? 'Sign in as buyer' : 'Add to cart'}</button>
}
