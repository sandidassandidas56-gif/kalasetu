'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { setAccountRole } from '@/app/actions/profile'

type Role = 'buyer' | 'seller'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [role, setRole] = useState<Role>(() => searchParams.get('role') === 'seller' ? 'seller' : 'buyer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')

  useEffect(() => {
    const requestedRole = searchParams.get('role')
    if (requestedRole === 'seller' || requestedRole === 'buyer') setRole(requestedRole)
    const authError = searchParams.get('error')
    if (authError === 'session-expired') setMessage('Your session expired. Please sign in again.')
  }, [searchParams])

  const databaseReady = Boolean(process.env.NEXT_PUBLIC_DATABASE_READY ?? true)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!databaseReady) {
      setMessage('Secure auth requires a configured PostgreSQL database and environment variables.')
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setPending(true)
    try {
      const result = mode === 'signup'
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        setMessage(result.error.message || (mode === 'signin' ? 'This email is not verified yet. Create the account again or complete its emailed verification code.' : 'We could not complete that request. Check your details and try again.'))
        return
      }

      if (mode === 'signup') {
        setOtpStep(true)
        setMessage('Your account was created. Enter the 6-digit code sent to your email.')
        return
      }

      await setAccountRole(role)
      router.push(role === 'seller' ? '/seller' : '/buyer')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration failed. Check your Vercel email settings and try again.')
    } finally {
      setPending(false)
    }
  }

  async function verifyRegistration() {
    setPending(true)
    setMessage('')
    try {
      const verification = await authClient.emailOtp.verifyEmail({ email, otp })
      if (verification.error) {
        setMessage(verification.error.message || 'That code is invalid or expired. Request a new code and try again.')
        return
      }
      await setAccountRole(role)
      router.push(role === 'seller' ? '/seller' : '/buyer')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Verification failed. Please request a new code.')
    } finally {
      setPending(false)
    }
  }

  async function resendOtp() {
    setPending(true)
    const result = await authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
    setPending(false)
    setMessage(result.error ? 'We could not send a new code.' : 'A new verification code was sent.')
  }

  async function signInWithGoogle() {
    setMessage('')
    setPending(true)
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: `/auth/complete?role=${role}`,
    })

    if (result.error) {
      setPending(false)
      setMessage(result.error.message || 'Google sign-in was cancelled or could not be completed. Check your provider configuration and try again.')
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
          {!otpStep && <div className="flex gap-6 border-b border-[#d8d1c4]"><button onClick={() => setMode('signin')} className={`pb-4 text-sm font-bold ${mode === 'signin' ? 'border-b-2 border-[#e17b3f] text-[#e17b3f]' : 'text-[#728078]'}`}>Sign in</button><button onClick={() => setMode('signup')} className={`pb-4 text-sm font-bold ${mode === 'signup' ? 'border-b-2 border-[#e17b3f] text-[#e17b3f]' : 'text-[#728078]'}`}>Create account</button></div>}
          <h2 className="mt-10 font-serif text-4xl">{otpStep ? 'Check your email.' : mode === 'signin' ? 'Welcome back.' : 'Join the circle.'}</h2>
          <p className="mt-3 text-sm text-[#728078]">{otpStep ? `Enter the 6-digit code sent to ${email}.` : mode === 'signin' ? 'Use your secure KalaSetu account to continue.' : 'Create a real account to participate.'}</p>
          {!otpStep && <div className="mt-7 grid grid-cols-2 gap-3" role="group" aria-label="Account type"><button type="button" onClick={() => setRole('buyer')} className={`rounded-xl border p-4 text-left ${role === 'buyer' ? 'border-[#e17b3f] bg-[#fff5ef]' : 'border-[#d8d1c4]'}`}><span className="block text-sm font-bold">Buyer</span><span className="mt-1 block text-xs text-[#728078]">Discover and collect</span></button><button type="button" onClick={() => setRole('seller')} className={`rounded-xl border p-4 text-left ${role === 'seller' ? 'border-[#e17b3f] bg-[#fff5ef]' : 'border-[#d8d1c4]'}`}><span className="block text-sm font-bold">Seller</span><span className="mt-1 block text-xs text-[#728078]">Share your craft</span></button></div>}
          {!databaseReady && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Secure auth is not active until PostgreSQL and the auth environment variables are configured.</p>}
          {!otpStep && <button type="button" disabled={pending || !databaseReady} onClick={() => void signInWithGoogle()} className="mt-6 w-full rounded-full border border-[#d8d1c4] px-6 py-3 font-bold disabled:opacity-60">Continue with Google</button>}
          <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a09a90]"><span className="h-px flex-1 bg-[#d8d1c4]" />or<span className="h-px flex-1 bg-[#d8d1c4]" /></div>
          {otpStep ? <div className="mt-6 flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-semibold">Verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className="rounded-xl border border-[#d8d1c4] px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#e17b3f]" /></label>{message && <p role="alert" className="text-sm text-red-700">{message}</p>}<button type="button" onClick={() => void verifyRegistration()} disabled={pending || otp.length !== 6} className="rounded-full bg-[#e17b3f] px-6 py-3 font-bold text-white disabled:opacity-60">{pending ? 'Verifying…' : 'Verify and continue'}</button><button type="button" onClick={() => void resendOtp()} disabled={pending} className="text-sm font-semibold text-[#65756c]">Send a new code</button></div> : <form onSubmit={submit} className="mt-6 flex flex-col gap-5">{mode === 'signup' && <label className="flex flex-col gap-2 text-sm font-semibold">Name<input required value={name} onChange={e => setName(e.target.value)} className="rounded-xl border border-[#d8d1c4] px-4 py-3 font-normal outline-none focus:border-[#e17b3f]" /></label>}<label className="flex flex-col gap-2 text-sm font-semibold">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border border-[#d8d1c4] px-4 py-3 font-normal outline-none focus:border-[#e17b3f]" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl border border-[#d8d1c4] px-4 py-3 font-normal outline-none focus:border-[#e17b3f]" /></label>{mode === 'signup' && <label className="flex flex-col gap-2 text-sm font-semibold">Confirm password<input required minLength={8} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="rounded-xl border border-[#d8d1c4] px-4 py-3 font-normal outline-none focus:border-[#e17b3f]" /></label>}{message && <p role="alert" className="text-sm text-red-700">{message}</p>}<button disabled={pending || !databaseReady} className="rounded-full bg-[#e17b3f] px-6 py-3 font-bold text-white disabled:opacity-60">{pending ? 'Please wait…' : mode === 'signin' ? `Continue as ${role}` : `Create ${role} account`}</button></form>}
        </section>
      </div>
    </main>
  )
}

export default function AuthPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#f7f2e9] px-6 py-12" />}><AuthContent /></Suspense>
}
