import { Router, Request, Response } from "express"
import { connectToMongo } from "../db.js"
import { requireFirebaseAuth } from "../middleware/firebaseAuth.js"
import { ObjectId } from "mongodb"

const router = Router()

router.use(requireFirebaseAuth)

async function getSellerId(firebaseUid: string): Promise<ObjectId | null> {
  const db = await connectToMongo()
  const seller = await db.collection("sellers").findOne({ firebaseUid })
  return seller ? (seller._id as ObjectId) : null
}

router.get("/payment-links", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid
  if (!firebaseUid) {
    res.status(401).json({ error: "UNAUTHORIZED" })
    return
  }

  const sellerId = await getSellerId(firebaseUid)
  if (!sellerId) {
    res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
    return
  }

  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20", 10)))
  const statusFilter = req.query.status as string | undefined
  const skip = (page - 1) * limit

  try {
    const db = await connectToMongo()
    const coll = db.collection("payment_links")
    const products = db.collection("products")

    const match: Record<string, unknown> = { sellerId }
    if (statusFilter && ["active", "paid", "expired", "cancelled"].includes(statusFilter)) {
      match.status = statusFilter
    }

    const [items, totalResult] = await Promise.all([
      coll
        .find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      coll.countDocuments(match),
    ])

    const productIds = [...new Set(items.map((i) => i.productId?.toString()).filter(Boolean))]
    const productMap: Record<string, { name: string }> = {}
    if (productIds.length > 0) {
      const prods = await products
        .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
        .toArray()
      prods.forEach((p) => {
        productMap[p._id.toString()] = { name: p.name }
      })
    }

    const formatted = items.map((i) => ({
      id: i._id,
      productId: i.productId,
      productName: productMap[i.productId?.toString()]?.name ?? "—",
      checkoutUrl: i.checkoutUrl ?? "",
      status: i.status ?? "active",
      createdAt: i.createdAt,
      paidAt: i.paidAt ?? null,
    }))

    res.json({
      items: formatted,
      pagination: { page, limit, total: totalResult, hasMore: skip + items.length < totalResult },
    })
  } catch (err) {
    console.error("[GET /sellers/me/payment-links]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch payment links" })
  }
})

export default router
