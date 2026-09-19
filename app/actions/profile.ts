'use server'

import { db, hasDatabaseConnection } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { auth, getCurrentSession } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function userId() { const session = await getCurrentSession(); if (!session?.user) throw new Error('Unauthorized'); return session.user.id }

export async function saveProfile(role: 'buyer' | 'seller', data: { avatarUrl?: string; address?: string; bio?: string; phone?: string; shopName?: string }) {
  const id = await userId()
  if (!hasDatabaseConnection()) {
    revalidatePath(role === 'buyer' ? '/buyer' : '/seller')
    return
  }
  if (role === 'buyer') {
    await db.execute(sql`INSERT INTO buyer_profiles (id, "userId", "avatarUrl", address, bio, phone) VALUES (${crypto.randomUUID()}, ${id}, ${data.avatarUrl ?? ''}, ${data.address ?? ''}, ${data.bio ?? ''}, ${data.phone ?? ''}) ON CONFLICT ("userId") DO UPDATE SET "avatarUrl" = EXCLUDED."avatarUrl", address = EXCLUDED.address, bio = EXCLUDED.bio, phone = EXCLUDED.phone`)
  } else {
    await db.execute(sql`INSERT INTO seller_profiles (id, "userId", "avatarUrl", "shopName", address, bio, phone) VALUES (${crypto.randomUUID()}, ${id}, ${data.avatarUrl ?? ''}, ${data.shopName ?? ''}, ${data.address ?? ''}, ${data.bio ?? ''}, ${data.phone ?? ''}) ON CONFLICT ("userId") DO UPDATE SET "avatarUrl" = EXCLUDED."avatarUrl", "shopName" = EXCLUDED."shopName", address = EXCLUDED.address, bio = EXCLUDED.bio, phone = EXCLUDED.phone`)
  }
  revalidatePath(role === 'buyer' ? '/buyer' : '/seller')
}

export async function setAccountRole(role: 'buyer' | 'seller') {
  if (!hasDatabaseConnection()) throw new Error('Database connection is required to set an account role.')
  const session = await getCurrentSession()
  if (!session?.user) throw new Error('Your authentication session could not be validated.')
  const currentRole = (session.user as { role?: string }).role
  if (currentRole === 'buyer' || currentRole === 'seller') return
  try {
    const result = await db.execute(sql`UPDATE "user" SET role = ${role}, "updatedAt" = now() WHERE id = ${session.user.id} AND (role IS NULL OR role = '')`)
    const rowsChanged = Number((result as { rowCount?: number }).rowCount ?? 0)
    if (rowsChanged !== 1) throw new Error('No authenticated user row was updated.')
  } catch (error) {
    console.error('AUTH ROLE SAVE FAILED', { userId: session.user.id, role, error: error instanceof Error ? error.message : 'unknown error' })
    throw new Error('The authenticated account could not save its KalaSetu role.')
  }
  revalidatePath('/seller')
  revalidatePath('/buyer')
}

export async function setAccountPassword(password: string) {
  if (!hasDatabaseConnection()) throw new Error('Database connection is required to set a password.')
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')
  const session = await getCurrentSession()
  if (!session?.user) throw new Error('Your authentication session could not be validated.')
  try {
    await auth.api.setPassword({ headers: await headers(), body: { newPassword: password } })
  } catch (error) {
    console.error('AUTH PASSWORD SAVE FAILED', { userId: session.user.id, error: error instanceof Error ? error.message : 'unknown error' })
    throw new Error('The authenticated account could not save its password.')
  }
}
