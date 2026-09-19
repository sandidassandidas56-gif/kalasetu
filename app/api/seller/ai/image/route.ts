import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth'
import { analyzeAndEnhanceImage } from '@/lib/ai/providers'

export const maxDuration = 60

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') {
    return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
  }

  try {
    const body = await request.json() as { imageDataUrl?: string }
    if (!body.imageDataUrl?.startsWith('data:image/')) return NextResponse.json({ error: 'A valid image is required.' }, { status: 400 })
    if (body.imageDataUrl.length > 14_000_000) return NextResponse.json({ error: 'Image is too large for processing.' }, { status: 413 })
    return NextResponse.json(await analyzeAndEnhanceImage(body.imageDataUrl))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Image analysis failed.' }, { status: 500 })
  }
}
