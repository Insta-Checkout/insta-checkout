import { Router } from "express"
import type { Request, Response } from "express"
import { ObjectId } from "mongodb"
import type { Filter, Document } from "mongodb"
import { connectToMongo } from "../db.js"
import { requireAdmin } from "../middleware/requireAdmin.js"

const router = Router()
router.use(requireAdmin)

// GET /admin/analytics — platform-wide stats
router.get("/analytics", async (_req: Request, res: Response) => {
  try {
    const db = await connectToMongo()
    const sellers = db.collection("sellers")
    const paymentLinks = db.collection("payment_links")

    const [totalSellers, totalLinks, confirmedStats] = await Promise.all([
      sellers.countDocuments(),
      paymentLinks.countDocuments(),
      paymentLinks
        .aggregate([
          { $match: { status: "confirmed" } },
          {
            $group: {
              _id: null,
              totalConfirmed: { $sum: 1 },
              totalVolume: { $sum: "$price" },
            },
          },
        ])
        .toArray(),
    ])

    const confirmed = confirmedStats[0] ?? { totalConfirmed: 0, totalVolume: 0 }

    res.json({
      totalSellers,
      totalPaymentLinks: totalLinks,
      totalConfirmedPayments: confirmed.totalConfirmed,
      totalVolume: confirmed.totalVolume,
    })
  } catch (err) {
    console.error("[GET /admin/analytics]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred" })
  }
})

// GET /admin/sellers?page=1&limit=20&search=keyword
router.get("/sellers", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const search = (req.query.search as string)?.trim() || ""
    const skip = (page - 1) * limit

    const db = await connectToMongo()
    const sellersCol = db.collection("sellers")

    const filter: Filter<Document> = {}
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ]
    }

    const [data, total] = await Promise.all([
      sellersCol
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .project({
          fullName: 1,
          businessName: 1,
          category: 1,
          email: 1,
          whatsappNumber: 1,
          whatsappVerified: 1,
          onboardingComplete: 1,
          createdAt: 1,
          logoUrl: 1,
        })
        .toArray(),
      sellersCol.countDocuments(filter),
    ])

    res.json({ data, total, page, limit })
  } catch (err) {
    console.error("[GET /admin/sellers]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred" })
  }
})

// GET /admin/sellers/:id — single seller with stats
router.get("/sellers/:id", async (req: Request, res: Response) => {
  try {
    let sellerId: ObjectId
    try {
      sellerId = new ObjectId(req.params.id)
    } catch {
      res.status(400).json({ error: "INVALID_ID", message: "Invalid seller ID format" })
      return
    }

    const db = await connectToMongo()
    const seller = await db.collection("sellers").findOne({ _id: sellerId }, {
      projection: {
        fullName: 1,
        businessName: 1,
        category: 1,
        email: 1,
        whatsappNumber: 1,
        whatsappVerified: 1,
        onboardingComplete: 1,
        instapayNumber: 1,
        maskedName: 1,
        createdAt: 1,
        logoUrl: 1,
        instagramUrl: 1,
        facebookUrl: 1,
      },
    })
    if (!seller) {
      res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
      return
    }

    const paymentLinks = db.collection("payment_links")
    const [linkCount, confirmedStats] = await Promise.all([
      paymentLinks.countDocuments({ sellerId }),
      paymentLinks
        .aggregate([
          { $match: { sellerId, status: "confirmed" } },
          { $group: { _id: null, count: { $sum: 1 }, volume: { $sum: "$price" } } },
        ])
        .toArray(),
    ])

    const stats = confirmedStats[0] ?? { count: 0, volume: 0 }

    res.json({
      seller,
      stats: {
        totalLinks: linkCount,
        confirmedPayments: stats.count,
        totalVolume: stats.volume,
      },
    })
  } catch (err) {
    console.error("[GET /admin/sellers/:id]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred" })
  }
})

export default router
