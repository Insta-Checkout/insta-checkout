import { Router, Request, Response } from "express"
import { connectToMongo } from "../db.js"
import { requireFirebaseAuth } from "../middleware/firebaseAuth.js"
import { ObjectId } from "mongodb"
import crypto from "crypto"

const router = Router()
const DEFAULT_TTL_DAYS = 7
const CHECKOUT_BASE_URL =
  process.env.CHECKOUT_BASE_URL ??
  (process.env.NODE_ENV === "production" ? "https://pay.instacheckout.co" : "http://localhost:3001")

router.use(requireFirebaseAuth)

async function getSellerId(firebaseUid: string): Promise<ObjectId | null> {
  const db = await connectToMongo()
  const seller = await db.collection("sellers").findOne({ firebaseUid })
  return seller ? (seller._id as ObjectId) : null
}

function generateToken(): string {
  return crypto.randomBytes(12).toString("base64url")
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
    if (statusFilter && ["active", "preview", "paid", "confirmed", "expired", "cancelled"].includes(statusFilter)) {
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
    const productMap: Record<string, { name: string; nameAr?: string | null; nameEn?: string | null }> = {}
    if (productIds.length > 0) {
      const prods = await products
        .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
        .toArray()
      prods.forEach((p) => {
        productMap[p._id.toString()] = {
          name: p.name,
          nameAr: p.nameAr ?? null,
          nameEn: p.nameEn ?? null,
        }
      })
    }

    const formatted = items.map((i) => ({
      id: i._id,
      productId: i.productId,
      productName: productMap[i.productId?.toString()]?.name ?? "—",
      productNameAr: productMap[i.productId?.toString()]?.nameAr ?? null,
      productNameEn: productMap[i.productId?.toString()]?.nameEn ?? null,
      checkoutUrl: i.checkoutUrl ?? "",
      status: i.status ?? "active",
      createdAt: i.createdAt,
      paidAt: i.paidAt ?? null,
      confirmedAt: i.confirmedAt ?? null,
      price: i.price ?? 0,
      ...((i.status === "paid" || i.status === "confirmed") && {
        buyerPhone: i.buyerPhone ?? null,
        buyerName: i.buyerName ?? null,
        screenshotUrl: i.screenshotUrl ?? null,
      }),
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

router.post("/products/:id/payment-links", async (req: Request, res: Response) => {
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

  let productId: ObjectId
  try {
    productId = new ObjectId(req.params.id)
  } catch {
    res.status(400).json({ error: "INVALID_ID", message: "Invalid product ID" })
    return
  }

  try {
    const db = await connectToMongo()
    const products = db.collection("products")
    const paymentLinks = db.collection("payment_links")

    const product = await products.findOne({ _id: productId, sellerId })
    if (!product) {
      res.status(404).json({ error: "NOT_FOUND", message: "Product not found" })
      return
    }
    if (product.status === "archived") {
      res.status(400).json({ error: "PRODUCT_ARCHIVED", message: "Cannot create link for archived product" })
      return
    }

    const seller = await db.collection("sellers").findOne({ _id: sellerId })
    const onboardingComplete = seller?.onboardingComplete ?? !!seller?.instapayLink
    const linkStatus = onboardingComplete ? "active" : "preview"

    const token = generateToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000)
    const checkoutUrl = `${CHECKOUT_BASE_URL.replace(/\/$/, "")}/l/${token}`

    const doc = {
      token,
      sellerId,
      productId,
      productName: product.name,
      productNameAr: product.nameAr ?? null,
      productNameEn: product.nameEn ?? null,
      productImageUrl: product.imageUrl ?? null,
      price: product.price,
      checkoutUrl,
      status: linkStatus,
      createdAt: now,
      expiresAt,
      paidAt: null,
      cancelledAt: null,
    }

    const result = await paymentLinks.insertOne(doc)

    res.status(201).json({
      paymentLinkId: result.insertedId,
      checkoutUrl,
      status: linkStatus,
      createdAt: now,
      expiresAt,
    })
  } catch (err) {
    console.error("[POST /sellers/me/products/:id/payment-links]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create payment link" })
  }
})

router.patch("/payment-links/:id/status", async (req: Request, res: Response) => {
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

  let linkId: ObjectId
  try {
    linkId = new ObjectId(req.params.id)
  } catch {
    res.status(400).json({ error: "INVALID_ID", message: "Invalid payment link ID" })
    return
  }

  const action = typeof req.body?.action === "string" ? req.body.action : null
  if (action !== "confirm") {
    res.status(400).json({ error: "VALIDATION_ERROR", message: "action must be 'confirm'" })
    return
  }

  try {
    const db = await connectToMongo()
    const paymentLinks = db.collection("payment_links")

    const link = await paymentLinks.findOne({ _id: linkId, sellerId })
    if (!link) {
      res.status(404).json({ error: "NOT_FOUND", message: "Payment link not found" })
      return
    }

    const status = link.status ?? "active"
    if (status !== "paid") {
      res.status(409).json({
        error: "INVALID_TRANSITION",
        message: "Only paid links can be confirmed",
      })
      return
    }

    const now = new Date()
    await paymentLinks.updateOne(
      { _id: linkId, sellerId },
      { $set: { status: "confirmed", confirmedAt: now, updatedAt: now } }
    )

    res.json({ success: true, status: "confirmed" })
  } catch (err) {
    console.error("[PATCH /sellers/me/payment-links/:id/status]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update payment link status" })
  }
})

router.delete("/payment-links/:id", async (req: Request, res: Response) => {
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

  let linkId: ObjectId
  try {
    linkId = new ObjectId(req.params.id)
  } catch {
    res.status(400).json({ error: "INVALID_ID", message: "Invalid payment link ID" })
    return
  }

  try {
    const db = await connectToMongo()
    const paymentLinks = db.collection("payment_links")

    const link = await paymentLinks.findOne({ _id: linkId, sellerId })
    if (!link) {
      res.status(404).json({ error: "NOT_FOUND", message: "Payment link not found" })
      return
    }
    if (link.status !== "active") {
      res.status(409).json({
        error: "NOT_CANCELLABLE",
        message: "Only active links can be cancelled",
      })
      return
    }
    if (new Date() > link.expiresAt) {
      await paymentLinks.updateOne(
        { _id: linkId },
        { $set: { status: "expired", updatedAt: new Date() } }
      )
      res.status(409).json({
        error: "EXPIRED",
        message: "Link has already expired",
      })
      return
    }

    const now = new Date()
    await paymentLinks.updateOne(
      { _id: linkId, sellerId },
      { $set: { status: "cancelled", cancelledAt: now, updatedAt: now } }
    )

    res.json({ success: true, message: "Payment link cancelled" })
  } catch (err) {
    console.error("[DELETE /sellers/me/payment-links/:id]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to cancel payment link" })
  }
})

export default router
