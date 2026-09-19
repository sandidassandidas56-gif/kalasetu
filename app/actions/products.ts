"use server"
import { db, ensureMarketplaceSchema, hasDatabaseConnection } from "@/lib/db"
import { sql } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function publishProduct(draft: Record<string, unknown>): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const session = await getCurrentSession()
    if (!session?.user || (session.user as { role?: string }).role !== "seller") return { ok: false, message: "Your seller session is no longer valid. Please sign in again." }
    const required = ["name", "category", "description", "finalPrice", "stock", "shipping", "state"]
    if (!required.every(key => String(draft[key] ?? "").trim())) return { ok: false, message: "Required product details are incomplete." }
    if (!hasDatabaseConnection()) return { ok: false, message: "The production database is not configured." }
    await ensureMarketplaceSchema()
    await db.execute(sql`INSERT INTO products (id, "sellerId", name, description, category, price, "imageUrl", state, availability, published) VALUES (${crypto.randomUUID()}, ${session.user.id}, ${String(draft.name)}, ${String(draft.description)}, ${String(draft.category)}, ${Number(draft.finalPrice)}, ${String((draft.images as string[] | undefined)?.[0] ?? "")}, ${String(draft.state)}, 'available', true)`)
    revalidatePath("/buyer")
    revalidatePath("/seller")
    return { ok: true }
  } catch (error) {
    console.error("PRODUCT PUBLISH FAILED", { error: error instanceof Error ? error.message : "unknown error" })
    return { ok: false, message: error instanceof Error ? error.message : "The product could not be published." }
  }
}
