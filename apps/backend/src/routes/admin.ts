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

    const [totalSellers, totalLinks, confirmedStats, approvalBreakdown] = await Promise.all([
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
      sellers
        .aggregate([
          { $group: { _id: "$approvalStatus", count: { $sum: 1 } } },
        ])
        .toArray(),
    ])

    const confirmed = confirmedStats[0] ?? { totalConfirmed: 0, totalVolume: 0 }

    const byStatus: Record<string, number> = { pending: 0, approved: 0, rejected: 0 }
    for (const row of approvalBreakdown) {
      const status = row._id as string
      if (status in byStatus) {
        byStatus[status] = row.count
      }
    }

    res.json({
      totalSellers,
      totalPaymentLinks: totalLinks,
      totalConfirmedPayments: confirmed.totalConfirmed,
      totalVolume: confirmed.totalVolume,
      sellersByApprovalStatus: byStatus,
    })
  } catch (err) {
    console.error("[GET /admin/analytics]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred" })
  }
})

// GET /admin/sellers/pending?page=1&limit=20
router.get("/sellers/pending", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit

    const db = await connectToMongo()
    const sellers = db.collection("sellers")
    const filter = { approvalStatus: "pending" }

    const [data, total] = await Promise.all([
      sellers
        .find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .project({
          fullName: 1,
          businessName: 1,
          category: 1,
          email: 1,
          whatsappNumber: 1,
          whatsappVerified: 1,
          instapayInfo: 1,
          logoUrl: 1,
          socialLinks: 1,
          onboardingComplete: 1,
          createdAt: 1,
          approvalStatus: 1,
        })
        .toArray(),
      sellers.countDocuments(filter),
    ])

    res.json({ data, total, page, limit })
  } catch (err) {
    console.error("[GET /admin/sellers/pending]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
  }
})

// GET /admin/sellers/pending/count
router.get("/sellers/pending/count", async (_req: Request, res: Response) => {
  try {
    const db = await connectToMongo()
    const count = await db.collection("sellers").countDocuments({ approvalStatus: "pending" })
    res.json({ count })
  } catch (err) {
    console.error("[GET /admin/sellers/pending/count]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
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
          approvalStatus: 1,
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

// PATCH /admin/sellers/:id/approval — approve or reject
router.patch("/sellers/:id/approval", async (req: Request, res: Response) => {
  try {
    let sellerId: ObjectId
    try {
      sellerId = new ObjectId(req.params.id)
    } catch {
      res.status(400).json({ error: "INVALID_ID" })
      return
    }

    const body = req.body as Record<string, unknown>
    const action = body.action as string
    if (action !== "approve" && action !== "reject") {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "action must be 'approve' or 'reject'" })
      return
    }

    const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : null
    const now = new Date()

    const db = await connectToMongo()
    const sellers = db.collection("sellers")

    const update: Record<string, unknown> = {
      approvalStatus: action === "approve" ? "approved" : "rejected",
      approvalNote: note,
      updatedAt: now,
    }

    if (action === "approve") {
      update.approvedAt = now
      update.rejectedAt = null
    } else {
      update.rejectedAt = now
    }

    const result = await sellers.findOneAndUpdate(
      { _id: sellerId },
      { $set: update },
      { returnDocument: "after" }
    )

    if (!result) {
      res.status(404).json({ error: "NOT_FOUND" })
      return
    }

    console.log(`[PATCH /admin/sellers/${req.params.id}/approval] ${action} by admin`)

    res.json({
      success: true,
      approvalStatus: result.approvalStatus,
      sellerId: result._id,
    })
  } catch (err) {
    console.error("[PATCH /admin/sellers/:id/approval]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
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
        instapayInfo: 1,
        maskedName: 1,
        maskedFullName: 1,
        createdAt: 1,
        logoUrl: 1,
        socialLinks: 1,
        approvalStatus: 1,
        approvalNote: 1,
        approvedAt: 1,
        rejectedAt: 1,
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

// GET /admin/sellers/:id/team — list team members for a seller
router.get("/sellers/:id/team", async (req: Request, res: Response) => {
  try {
    let sellerId: ObjectId
    try {
      sellerId = new ObjectId(req.params.id)
    } catch {
      res.status(400).json({ error: "INVALID_ID", message: "Invalid seller ID format" })
      return
    }

    const db = await connectToMongo()

    const seller = await db.collection("sellers").findOne({ _id: sellerId })
    if (!seller) {
      res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
      return
    }

    const members = await db.collection("memberships")
      .find({ sellerId })
      .sort({ joinedAt: -1 })
      .toArray()

    const pendingInvites = await db.collection("invitations")
      .find({ sellerId, status: "pending" })
      .sort({ createdAt: -1 })
      .toArray()

    res.json({
      members: members.map((m) => ({
        id: m._id,
        email: m.email,
        displayName: m.displayName,
        roleLabel: m.roleLabel,
        permissions: m.permissions,
        invitedBy: m.invitedBy,
        joinedAt: m.joinedAt,
      })),
      pendingInvites: pendingInvites.map((i) => ({
        id: i._id,
        email: i.inviteeEmail,
        roleLabel: i.roleLabel,
        permissions: i.permissions,
        expiresAt: i.expiresAt,
        createdAt: i.createdAt,
      })),
    })
  } catch (err) {
    console.error("[GET /admin/sellers/:id/team]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred" })
  }
})

export default router
