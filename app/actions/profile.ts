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

export async function saveSellerProfile(formData: FormData) {
  await saveProfile('seller', {
    shopName: String(formData.get('shopName') ?? '').trim(),
    state: String(formData.get('state') ?? '').trim(),
    bio: String(formData.get('bio') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
  })
  revalidatePath('/seller/profile')
}

export async function setAccountRole(role: 'buyer' | 'seller'): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    if (!hasDatabaseConnection()) return { ok: false, message: 'Database connection is required to set an account role.' }
    const session = await getCurrentSession()
    if (!session?.user) return { ok: false, message: 'Your authentication session could not be validated.' }
    const currentRole = (session.user as { role?: string }).role
    if (currentRole === role) return { ok: true }
    await db.execute(sql`UPDATE "user" SET role = ${role}, "updatedAt" = now() WHERE id = ${session.user.id}`)
    const result = await db.execute(sql`SELECT role FROM "user" WHERE id = ${session.user.id} LIMIT 1`)
    const persistedRole = (result as { rows?: { role?: string | null }[] }).rows?.[0]?.role
    if (persistedRole !== role) return { ok: false, message: 'The selected KalaSetu role was not persisted.' }
    revalidatePath('/seller')
    revalidatePath('/buyer')
    return { ok: true }
  } catch (error) {
    console.error('AUTH ROLE SAVE FAILED', { role, error: error instanceof Error ? error.message : 'unknown error' })
    return { ok: false, message: error instanceof Error ? error.message : 'The authenticated account could not save its KalaSetu role.' }
  }
}

export async function setAccountPassword(password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    if (!hasDatabaseConnection()) return { ok: false, message: 'Database connection is required to set a password.' }
    if (password.length < 8) return { ok: false, message: 'Password must be at least 8 characters.' }
    const session = await getCurrentSession()
    if (!session?.user) return { ok: false, message: 'Your authentication session could not be validated.' }
    const existingCredential = await db.execute(sql`SELECT 1 FROM account WHERE "userId" = ${session.user.id} AND "providerId" = 'credential' AND password IS NOT NULL LIMIT 1`)
    if (((existingCredential as { rows?: unknown[] }).rows ?? []).length > 0) return { ok: true }
    await auth.api.setPassword({ headers: await headers(), body: { newPassword: password } })
    return { ok: true }
  } catch (error) {
    console.error('AUTH PASSWORD SAVE FAILED', { error: error instanceof Error ? error.message : 'unknown error' })
    return { ok: false, message: error instanceof Error ? error.message : 'The authenticated account could not save its password.' }
  }
}

export async function getAccountRole() {
  const session = await getCurrentSession()
  if (!session?.user) throw new Error('Your authentication session could not be validated.')
  if (!hasDatabaseConnection()) throw new Error('Database connection is required to read an account role.')
  const result = await db.execute(sql`SELECT role FROM "user" WHERE id = ${session.user.id} LIMIT 1`)
  const role = (result as { rows?: { role?: string | null }[] }).rows?.[0]?.role
  if (role !== 'buyer' && role !== 'seller') throw new Error('The account role was not persisted.')
  return role
}
