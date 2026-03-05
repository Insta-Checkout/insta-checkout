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

function validateProductBody(body: Record<string, unknown>): { ok: boolean; data?: Record<string, unknown>; errors?: string[] } {
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const price = typeof body.price === "number" ? body.price : typeof body.price === "string" ? parseFloat(body.price) : NaN
  const description = typeof body.description === "string" ? body.description.trim() || null : null
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null
  const category = typeof body.category === "string" ? body.category.trim() || null : null

  const errors: string[] = []
  if (!name || name.length < 2) errors.push("name must be at least 2 characters")
  if (name.length > 80) errors.push("name must be at most 80 characters")
  if (isNaN(price) || price <= 0) errors.push("price must be a positive number")
  if (price > 1_000_000) errors.push("price exceeds maximum")
  if (imageUrl) {
    try {
      new URL(imageUrl)
    } catch {
      errors.push("imageUrl must be a valid URL")
    }
  }

  if (errors.length > 0) return { ok: false, errors }
  return {
    ok: true,
    data: { name, price: Math.round(price), description, imageUrl, category },
  }
}

router.get("/products", async (req: Request, res: Response) => {
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
  const q = (req.query.q as string)?.trim()
  const skip = (page - 1) * limit

  try {
    const db = await connectToMongo()
    const products = db.collection("products")

    const match: Record<string, unknown> = { sellerId }
    if (statusFilter && ["active", "archived"].includes(statusFilter)) {
      match.status = statusFilter
    }
    if (q) {
      match.name = { $regex: q, $options: "i" }
    }

    const [items, totalResult] = await Promise.all([
      products
        .find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      products.countDocuments(match),
    ])

    const formatted = items.map((p) => ({
      id: p._id,
      sellerId: p.sellerId,
      name: p.name,
      price: p.price,
      description: p.description ?? null,
      imageUrl: p.imageUrl ?? null,
      category: p.category ?? null,
      status: p.status ?? "active",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))

    res.json({
      items: formatted,
      pagination: { page, limit, total: totalResult, hasMore: skip + items.length < totalResult },
    })
  } catch (err) {
    console.error("[GET /sellers/me/products]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch products" })
  }
})

router.post("/products", async (req: Request, res: Response) => {
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

  const validation = validateProductBody(req.body as Record<string, unknown>)
  if (!validation.ok) {
    res.status(400).json({ error: "VALIDATION_ERROR", details: validation.errors })
    return
  }

  const { name, price, description, imageUrl, category } = validation.data!

  try {
    const db = await connectToMongo()
    const products = db.collection("products")
    const now = new Date()

    const doc = {
      sellerId,
      name,
      price,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      category: category ?? null,
      status: "active",
      timesGenerated: 0,
      lastGeneratedAt: now,
      isSaved: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = await products.insertOne(doc)

    res.status(201).json({
      id: result.insertedId,
      ...doc,
    })
  } catch (err) {
    console.error("[POST /sellers/me/products]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create product" })
  }
})

router.put("/products/:id", async (req: Request, res: Response) => {
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

  const body = req.body as Record<string, unknown>
  const updates: Record<string, unknown> = { updatedAt: new Date() }

  if (typeof body.name === "string" && body.name.trim()) {
    const name = body.name.trim()
    if (name.length < 2) {
      res.status(400).json({ error: "VALIDATION_ERROR", details: ["name must be at least 2 characters"] })
      return
    }
    if (name.length > 80) {
      res.status(400).json({ error: "VALIDATION_ERROR", details: ["name must be at most 80 characters"] })
      return
    }
    updates.name = name
  }
  if (typeof body.price === "number" && body.price > 0) {
    updates.price = Math.round(body.price)
  } else if (typeof body.price === "string") {
    const p = parseFloat(body.price)
    if (!isNaN(p) && p > 0) updates.price = Math.round(p)
  }
  if (body.description !== undefined) updates.description = typeof body.description === "string" ? body.description.trim() || null : null
  if (body.imageUrl !== undefined) {
    const url = typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null
    if (url) {
      try {
        new URL(url)
      } catch {
        res.status(400).json({ error: "VALIDATION_ERROR", details: ["imageUrl must be a valid URL"] })
        return
      }
    }
    updates.imageUrl = url
  }
  if (body.category !== undefined) updates.category = typeof body.category === "string" ? body.category.trim() || null : null
  if (body.status === "active" || body.status === "archived") updates.status = body.status

  if (Object.keys(updates).length <= 1) {
    res.status(400).json({ error: "VALIDATION_ERROR", details: ["No valid fields to update"] })
    return
  }

  try {
    const db = await connectToMongo()
    const products = db.collection("products")

    const result = await products.findOneAndUpdate(
      { _id: productId, sellerId },
      { $set: updates },
      { returnDocument: "after" }
    )

    if (!result) {
      res.status(404).json({ error: "NOT_FOUND", message: "Product not found" })
      return
    }

    res.json({
      id: result._id,
      sellerId: result.sellerId,
      name: result.name,
      price: result.price,
      description: result.description ?? null,
      imageUrl: result.imageUrl ?? null,
      category: result.category ?? null,
      status: result.status ?? "active",
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    })
  } catch (err) {
    console.error("[PUT /products/:id]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update product" })
  }
})

router.delete("/products/:id", async (req: Request, res: Response) => {
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
    const orders = db.collection("orders")

    const product = await products.findOne({ _id: productId, sellerId })
    if (!product) {
      res.status(404).json({ error: "NOT_FOUND", message: "Product not found" })
      return
    }

    const orderCount = await orders.countDocuments({ productId })
    if (orderCount > 0) {
      res.status(409).json({
        error: "HAS_ORDERS",
        message: "Cannot delete product with existing orders. Archive it instead.",
      })
      return
    }

    await products.updateOne(
      { _id: productId, sellerId },
      { $set: { status: "archived", updatedAt: new Date() } }
    )

    res.json({ success: true, message: "Product archived" })
  } catch (err) {
    console.error("[DELETE /products/:id]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete product" })
  }
})

export default router
