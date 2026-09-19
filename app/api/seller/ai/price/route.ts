import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== 'seller') return NextResponse.json({ error: 'Seller access required' }, { status: 401 })

  const body = await request.json() as { rawMaterialCost?: number; labourCost?: number; packagingCost?: number; otherCost?: number; shippingCost?: number; quantity?: number; marketPrices?: number[] }
  const values = [body.rawMaterialCost, body.labourCost, body.packagingCost, body.otherCost, body.shippingCost]
  if (values.some((value) => value !== undefined && (!Number.isFinite(value) || value < 0))) return NextResponse.json({ error: 'Costs must be valid positive numbers.' }, { status: 400 })
  const quantity = Math.max(Number(body.quantity) || 1, 1)
  const totalCost = values.reduce((sum, value) => sum + (Number(value) || 0), 0) / quantity
  const marketPrices = (body.marketPrices ?? []).filter((value) => Number.isFinite(value) && value > 0)
  if (!marketPrices.length) return NextResponse.json({ totalCost, marketRange: null, suggestedPrice: Math.ceil(totalCost * 1.35), estimated: true, note: 'No legitimate market-price data was supplied; the suggested price is a cost-plus estimate.' })
  const low = Math.min(...marketPrices)
  const high = Math.max(...marketPrices)
  return NextResponse.json({ totalCost, marketRange: { low, high }, suggestedPrice: Math.round((low + high) / 2), estimated: false, note: 'Market range calculated from supplied comparable prices.' })
}
