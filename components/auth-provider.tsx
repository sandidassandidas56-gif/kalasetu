'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export type AccountRole = 'buyer' | 'seller'

type AuthContextValue = {
  user: typeof authClient.$Infer.Session.user | null
  session: typeof authClient.$Infer.Session | null
  isAuthenticated: boolean
  isLoading: boolean
  role: AccountRole | null
  isVerified: boolean
  error: Error | null
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionState = authClient.useSession()
  const session = sessionState.data ?? null
  const user = session?.user ?? null
  const roleValue = (user as { role?: string } | null)?.role
  const role = roleValue === 'seller' || roleValue === 'buyer' ? roleValue : null
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.debug('AUTH INITIALIZING')
  }, [])

  useEffect(() => {
    if (sessionState.isPending || process.env.NODE_ENV !== 'development') return
    console.debug(user ? 'AUTH SESSION FOUND' : 'UNAUTHENTICATED → LOGIN')
    if (user) {
      console.debug('AUTH USER LOADED')
      console.debug(role ? 'AUTH ROLE LOADED' : 'AUTH ROLE LOADED: MISSING')
    }
  }, [role, sessionState.isPending, user])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && sessionState.isRefetching) console.debug('AUTH SESSION REFRESHED')
  }, [sessionState.isRefetching])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !sessionState.isPending) {
      console.debug(`AUTH ROUTE CHECK ${pathname}`)
      if (user) console.debug('AUTHENTICATED → ALLOW')
    }
  }, [pathname, sessionState.isPending, user])

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: Boolean(user),
      isLoading: sessionState.isPending,
      role,
      isVerified: Boolean(user?.emailVerified),
      error: sessionState.error ? new Error(sessionState.error.message) : null,
      refresh: sessionState.refetch,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export function RequireSeller({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, role, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) router.replace('/auth?role=seller&error=session-expired')
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-sm text-[#65756c]">Checking your secure session...</main>
  if (error) return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-sm text-red-700">Your session could not be validated. Please try signing in again.</main>
  if (!isAuthenticated) return null
  if (role !== 'seller') return <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-sm text-[#65756c]">Seller access is required for this page.</main>
  return children
}