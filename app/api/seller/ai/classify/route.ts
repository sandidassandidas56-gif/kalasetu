import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth'
import { classifyProduct, type ProductDraft } from '@/lib/ai/providers'

export const maxDuration = 30

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') {
    return NextResponse.json({ error: 'Seller access required' }, { status: 401 })
  }

  try {
    const body = await request.json() as { transcript: string; imageAnalysis?: Parameters<typeof classifyProduct>[0]['imageAnalysis']; product: ProductDraft }
    if (!body.product || !body.transcript?.trim()) return NextResponse.json({ error: 'Product information is required.' }, { status: 400 })
    return NextResponse.json(await classifyProduct(body))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Classification failed.' }, { status: 500 })
  }
}
