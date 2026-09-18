"use server"
import { db, hasDatabaseConnection } from "@/lib/db"
import { sql } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function publishProduct(draft: Record<string, unknown>) {
  const session = await getCurrentSession()
  if (!session?.user || (session.user as { role?: string }).role !== "seller") throw new Error("Unauthorized")
  const required = ["name", "category", "description", "finalPrice", "stock", "shipping", "state"]
  if (!required.every(key => String(draft[key] ?? "").trim())) throw new Error("Required product details are incomplete")
  if (!hasDatabaseConnection()) {
    revalidatePath("/buyer")
    revalidatePath("/seller")
    return
  }
  await db.execute(sql`INSERT INTO products (id, "sellerId", name, description, category, price, "imageUrl", state, availability, published) VALUES (${crypto.randomUUID()}, ${session.user.id}, ${String(draft.name)}, ${String(draft.description)}, ${String(draft.category)}, ${Number(draft.finalPrice)}, ${String((draft.images as string[] | undefined)?.[0] ?? "")}, ${String(draft.state)}, 'available', true)`)
  revalidatePath("/buyer")
  revalidatePath("/seller")
}
