'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setAccountRole } from '@/app/actions/profile'
import { useAuth } from '@/components/auth-provider'

function AuthCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, role, isLoading, isVerified, error } = useAuth()
  const [message, setMessage] = useState('Finishing secure sign-in...')
  const [saving, setSaving] = useState(false)
  const suggestedRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer'

  useEffect(() => {
    if (isLoading || saving || !user || !role) return
    if (role === suggestedRole) router.replace(role === 'seller' ? '/seller' : '/buyer')
    else setMessage(`This Google account is already registered as a ${role === 'seller' ? 'Seller' : 'Buyer'}. Please continue as a ${role === 'seller' ? 'Seller' : 'Buyer'}.`)
  }, [isLoading, role, router, saving, suggestedRole, user])

  async function finishRegistration() {
    setSaving(true)
    setMessage('Finishing your secure KalaSetu account...')
    const roleResult = await setAccountRole(suggestedRole)
    if (!roleResult.ok) {
      setSaving(false)
      setMessage(roleResult.message)
      return
    }
    window.location.assign(suggestedRole === 'seller' ? '/seller' : '/buyer')
  }

  useEffect(() => {
    if (!isLoading && user && !role && !saving) void finishRegistration()
  }, [isLoading, role, saving, user])

  if (error || (!isLoading && !user)) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-sm text-red-700">Google sign-in did not create a valid KalaSetu session. Please try again.</main>
  if (isLoading || !user) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><p className="rounded-2xl bg-white p-6 text-sm font-semibold">{message}</p></main>
  if (!isVerified) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-sm text-red-700">Google did not confirm this email address, so the KalaSetu account was not activated.</main>
  if (role === suggestedRole || (!role && !message)) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><p className="rounded-2xl bg-white p-6 text-sm font-semibold">{message || 'Opening your KalaSetu account...'}</p></main>
  if (role && role !== suggestedRole) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><section className="w-full max-w-md rounded-3xl bg-white p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Existing account found</p><h1 className="mt-3 font-serif text-4xl">Continue as {role}.</h1><p className="mt-3 text-sm leading-6 text-red-700" role="alert">{message}</p><a href={role === 'seller' ? '/seller' : '/buyer'} className="mt-6 inline-flex rounded-full bg-[#20342b] px-5 py-3 text-sm font-bold text-white">Continue as {role}</a></section></main>
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><p className="rounded-2xl bg-white p-6 text-sm text-red-700" role="alert">{message}</p></main>
}

export default function AuthCompletePage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#20342b]"><p className="rounded-2xl bg-white p-6 text-sm font-semibold">Finishing secure sign-in...</p></main>}><AuthCompleteContent /></Suspense>
}