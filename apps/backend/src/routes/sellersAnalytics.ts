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
  const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  // Use end of day for "to" so confirmations on that day are included
  let toDate: Date
  if (to) {
    toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)
  } else {
    toDate = now
  }
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
    const paymentLinks = db.collection("payment_links")

    // Stats from confirmed payment links (seller confirmed payment received)
    const confirmedPipeline = [
      { $match: { sellerId, status: "confirmed" } },
      { $match: { confirmedAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          totalPayments: { $sum: 1 },
        },
      },
    ]
    const confirmedResult = await paymentLinks.aggregate(confirmedPipeline).toArray()
    const totalRevenue = confirmedResult[0]?.totalRevenue ?? 0
    const totalPayments = confirmedResult[0]?.totalPayments ?? 0
    const aov = totalPayments > 0 ? Math.round(totalRevenue / totalPayments) : 0

    const activeLinksCount = await paymentLinks.countDocuments({
      sellerId,
      status: "active",
      expiresAt: { $gt: new Date() },
    })

    const dateFormat = granularity === "weekly" ? "%Y-W%V" : "%Y-%m-%d"
    const revenuePipeline = [
      { $match: { sellerId, status: "confirmed" } },
      { $match: { confirmedAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: "$confirmedAt",
            },
          },
          revenue: { $sum: "$price" },
          payments: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]
    const revenueOverTime = await paymentLinks.aggregate(revenuePipeline).toArray()

    res.json({
      totalRevenue,
      totalPayments,
      aov,
      activeLinksCount,
      revenueOverTime: revenueOverTime.map((r) => ({
        date: r._id,
        revenue: r.revenue,
        payments: r.payments,
      })),
    })
  } catch (err) {
    console.error("[GET /sellers/me/analytics]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch analytics" })
  }
})

router.post("/resend-verification", async (req: Request, res: Response) => {
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

  try {
    const db = await connectToMongo()
    const seller = await db.collection("sellers").findOne({ _id: sellerId })
    if (!seller?.whatsappNumber) {
      res.status(400).json({ error: "NO_WHATSAPP", message: "No WhatsApp number" })
      return
    }
    if (seller.whatsappVerified) {
      res.status(400).json({ error: "ALREADY_VERIFIED", message: "Already verified" })
      return
    }

    const { createVerification, sendOtpViaWhatsApp } = await import("../services/verification.js")
    const { code } = await createVerification(sellerId, seller.whatsappNumber)
    sendOtpViaWhatsApp(seller.whatsappNumber, code)

    res.json({ success: true, message: "Verification code sent" })
  } catch (err) {
    console.error("[POST /sellers/me/resend-verification]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to send verification" })
  }
})

export default router
