'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

function AuthContent() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [message, setMessage] = useState(searchParams.get('error') === 'session-expired' ? 'Your session expired. Please sign in again.' : '')
  const [pending, setPending] = useState(false)

  async function continueWithGoogle() {
    setPending(true)
    setMessage('')
    const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/auth/complete' })
    if (result.error) {
      setPending(false)
      setMessage(result.error.message || 'Google sign-in was cancelled or could not be completed. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f2e9] px-6 py-12 text-[#20352f]">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">
        <section className="bg-[#163f38] p-10 text-[#f7f2e9] lg:p-16">
          <a href="/" className="font-serif text-3xl">KalaSetu</a>
          <div className="mt-24 max-w-sm"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e17b3f]">Made by hand</p><h1 className="mt-5 font-serif text-5xl leading-tight">A more meaningful way to buy or sell craft.</h1><p className="mt-6 leading-7 text-[#d8e1d9]">Join a community that keeps India&apos;s living heritage moving forward.</p></div>
        </section>
        <section className="p-8 sm:p-12 lg:p-16">
          <div className="flex gap-6 border-b border-[#d8d1c4]"><button type="button" onClick={() => { setMode('signin'); setMessage('') }} className={`pb-4 text-sm font-bold ${mode === 'signin' ? 'border-b-2 border-[#e17b3f] text-[#e17b3f]' : 'text-[#728078]'}`}>Sign in</button><button type="button" onClick={() => { setMode('signup'); setMessage('') }} className={`pb-4 text-sm font-bold ${mode === 'signup' ? 'border-b-2 border-[#e17b3f] text-[#e17b3f]' : 'text-[#728078]'}`}>Create account</button></div>
          <h2 className="mt-10 font-serif text-4xl">{mode === 'signin' ? 'Welcome back.' : 'Join the circle.'}</h2>
          <p className="mt-3 text-sm text-[#728078]">{mode === 'signin' ? 'Sign in securely with your Google account.' : 'Create your KalaSetu account with Google.'}</p>
          <button type="button" disabled={pending} onClick={() => void continueWithGoogle()} className="mt-8 w-full rounded-full border border-[#d8d1c4] px-6 py-3 font-bold disabled:opacity-60">{pending ? 'Connecting to Google...' : 'Continue with Google'}</button>
          <p className="mt-5 text-center text-xs leading-5 text-[#728078]">After Google verifies your account, new users choose Buyer or Seller. Existing users continue with their saved role.</p>
          {message && <p role="alert" className="mt-5 text-sm text-red-700">{message}</p>}
        </section>
      </div>
    </main>
  )
}

export default function AuthPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#f7f2e9] px-6 py-12" />}><AuthContent /></Suspense>
}
