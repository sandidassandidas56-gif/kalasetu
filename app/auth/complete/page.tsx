'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setAccountRole } from '@/app/actions/profile'
import { useAuth, type AccountRole } from '@/components/auth-provider'

function AuthCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, role, isLoading, isVerified, error } = useAuth()
  const [message, setMessage] = useState('Finishing secure sign-in...')
  const [saving, setSaving] = useState(false)
  const suggestedRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer'

  useEffect(() => {
    if (isLoading || saving || !user || !role) return
    router.replace(role === 'seller' ? '/seller' : '/buyer')
  }, [isLoading, role, router, saving, user])

  async function chooseRole(nextRole: AccountRole) {
    setSaving(true)
    setMessage('Saving your account role...')
    try {
      await setAccountRole(nextRole)
      router.replace(nextRole === 'seller' ? '/seller' : '/buyer')
    } catch {
      setSaving(false)
      setMessage('Your Google account is authenticated, but the KalaSetu role could not be saved. Please try again.')
    }
  }

  if (error || (!isLoading && !user)) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-sm text-red-700">Google sign-in did not create a valid KalaSetu session. Please try again.</main>
  if (isLoading || !user) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><p className="rounded-2xl bg-white p-6 text-sm font-semibold">{message}</p></main>
  if (!isVerified) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-sm text-red-700">Google did not confirm this email address, so the KalaSetu account was not activated.</main>
  if (role) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><p className="rounded-2xl bg-white p-6 text-sm font-semibold">Opening your KalaSetu account...</p></main>
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><section className="w-full max-w-md rounded-3xl bg-white p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Google account verified by provider</p><h1 className="mt-3 font-serif text-4xl">Choose your KalaSetu path.</h1><p className="mt-3 text-sm text-[#65756c]">Your Google session is active. Choose a role to finish setting up your account.</p><div className="mt-7 grid gap-3"><button type="button" disabled={saving} onClick={() => void chooseRole(suggestedRole)} className="rounded-full bg-[#20342b] px-5 py-3 text-sm font-bold text-white">Continue as {suggestedRole}</button><button type="button" disabled={saving} onClick={() => void chooseRole(suggestedRole === 'seller' ? 'buyer' : 'seller')} className="rounded-full border border-[#d8d1c4] px-5 py-3 text-sm font-bold">Continue as {suggestedRole === 'seller' ? 'buyer' : 'seller'}</button></div><p className="mt-5 text-sm text-red-700" role="alert">{message !== 'Finishing secure sign-in...' ? message : ''}</p></section></main>
}

export default function AuthCompletePage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><p className="rounded-2xl bg-white p-6 text-sm font-semibold">Finishing secure sign-in...</p></main>}><AuthCompleteContent /></Suspense>
}