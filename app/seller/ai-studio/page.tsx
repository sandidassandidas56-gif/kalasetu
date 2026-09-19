import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth'
import AIStudio from '@/components/seller-ai-studio'
import { RequireSeller } from '@/components/auth-provider'

export default async function SellerAIStudioPage() {
  const session = await getCurrentSession()
  if (!session?.user) redirect('/auth?role=seller')
  if ((session.user as { role?: string }).role !== 'seller') redirect('/buyer')
  return <RequireSeller><AIStudio /></RequireSeller>
}
