'use server'

import { db, hasDatabaseConnection } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { getCurrentSession } from '@/lib/auth'
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
