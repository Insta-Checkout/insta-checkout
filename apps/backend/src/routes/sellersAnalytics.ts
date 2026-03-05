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

function parseDateRange(from?: string, to?: string): { from: Date; to: Date } {
  const now = new Date()
  const toDate = to ? new Date(to) : now
  const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { from: fromDate, to: toDate }
}

router.get("/analytics", async (req: Request, res: Response) => {
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

  const from = req.query.from as string | undefined
  const to = req.query.to as string | undefined
  const granularity = (req.query.granularity as string) || "daily"

  const { from: fromDate, to: toDate } = parseDateRange(from, to)

  try {
    const db = await connectToMongo()
    const orders = db.collection("orders")

    const paidPipeline = [
      { $match: { sellerId, status: "confirmed" } },
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          totalOrders: { $sum: 1 },
        },
      },
    ]

    const paidResult = await orders.aggregate(paidPipeline).toArray()
    const totalRevenue = paidResult[0]?.totalRevenue ?? 0
    const totalOrders = paidResult[0]?.totalOrders ?? 0
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    const activeLinksCount = 0

    const dateFormat = granularity === "weekly" ? "%Y-W%V" : "%Y-%m-%d"
    const revenuePipeline = [
      { $match: { sellerId, status: "confirmed" } },
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: "$createdAt",
            },
          },
          revenue: { $sum: "$price" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]

    const revenueOverTime = await orders.aggregate(revenuePipeline).toArray()

    res.json({
      totalRevenue,
      totalOrders,
      aov,
      activeLinksCount,
      revenueOverTime: revenueOverTime.map((r) => ({
        date: r._id,
        revenue: r.revenue,
        orders: r.orders,
      })),
    })
  } catch (err) {
    console.error("[GET /sellers/me/analytics]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch analytics" })
  }
})

router.get("/orders", async (req: Request, res: Response) => {
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
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "10", 10)))
  const statusFilter = req.query.status as string | undefined
  const skip = (page - 1) * limit

  try {
    const db = await connectToMongo()
    const orders = db.collection("orders")

    const match: Record<string, unknown> = { sellerId }
    if (statusFilter) {
      const statuses = statusFilter.split(",").map((s) => s.trim())
      if (statuses.length > 0) {
        match.status = { $in: statuses }
      }
    }

    const [items, totalResult] = await Promise.all([
      orders
        .find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      orders.countDocuments(match),
    ])

    const formattedItems = items.map((o) => ({
      orderId: o._id,
      productId: o.productId,
      productName: o.productName,
      paymentLinkId: o.paymentLinkId ?? null,
      amount: o.price,
      currency: "EGP",
      status: o.status,
      createdAt: o.createdAt,
      paidAt: o.confirmedAt ?? null,
    }))

    res.json({
      items: formattedItems,
      pagination: {
        page,
        limit,
        total: totalResult,
        hasMore: skip + items.length < totalResult,
      },
    })
  } catch (err) {
    console.error("[GET /sellers/me/orders]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch orders" })
  }
})

export default router
