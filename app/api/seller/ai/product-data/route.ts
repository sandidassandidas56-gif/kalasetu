import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth'
import { extractProductData } from '@/lib/ai/providers'

export const maxDuration = 30

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') {
    return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
  }

  try {
    const body = await request.json() as { transcript?: string; imageAnalysis?: Parameters<typeof extractProductData>[1] }
    if (!body.transcript?.trim()) return NextResponse.json({ error: 'Voice transcript is required.' }, { status: 400 })
    return NextResponse.json(await extractProductData(body.transcript.trim(), body.imageAnalysis))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Product data generation failed.' }, { status: 500 })
  }
}
