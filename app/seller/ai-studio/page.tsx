import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getCurrentSession } from '@/lib/auth'
import AIStudio from '@/components/seller-ai-studio'

export default async function SellerAIStudioPage() {
  const session = await getCurrentSession()
  if (!session?.user) redirect('/auth?role=seller')
  if ((session.user as { role?: string }).role !== 'seller') redirect('/buyer')
  return <AIStudio />
}
