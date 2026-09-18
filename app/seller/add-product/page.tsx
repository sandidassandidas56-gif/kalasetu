import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getCurrentSession } from "@/lib/auth"
import ProductCreationWizard from "@/components/product-creation-wizard"

export default async function AddProductPage() {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/auth?role=seller")
  if ((session.user as { role?: string }).role !== "seller") redirect("/buyer")
  return <ProductCreationWizard />
}
