import { Router, Request, Response } from "express"
import { connectToMongo } from "../db.js"
import { requireFirebaseAuth } from "../middleware/firebaseAuth.js"
import sellersAnalyticsRouter from "./sellersAnalytics.js"
import sellersProductsRouter from "./sellersProducts.js"
import sellersPaymentLinksRouter from "./sellersPaymentLinks.js"

const router = Router()
router.use(requireFirebaseAuth)

/** Debug: returns current Firebase UID from token. Use to verify it matches a seller's firebaseUid in MongoDB. */
router.get("/debug", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid
  if (!firebaseUid) {
    res.status(401).json({ error: "UNAUTHORIZED" })
    return
  }
  try {
    const db = await connectToMongo()
    const seller = await db.collection("sellers").findOne({ firebaseUid })
    res.json({
      firebaseUid,
      sellerFound: !!seller,
      sellerEmail: seller?.email ?? null,
      sellerBusinessName: seller?.businessName ?? null,
      hint: seller ? "Your session matches this seller." : "No seller in DB with this firebaseUid. Ensure you're logged in with the same account you used during onboarding.",
    })
  } catch (err) {
    console.error("[GET /sellers/me/debug]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
  }
})

async function getSeller(firebaseUid: string) {
  const db = await connectToMongo()
  return db.collection("sellers").findOne({ firebaseUid })
}

router.get("/", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid
  if (!firebaseUid) {
    res.status(401).json({ error: "UNAUTHORIZED" })
    return
  }
  try {
    const seller = await getSeller(firebaseUid)
    if (!seller) {
      res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
      return
    }
    res.json({
      id: seller._id,
      businessName: seller.businessName,
      preferredLocale: seller.preferredLocale ?? null,
      email: seller.email,
      whatsappVerified: seller.whatsappVerified,
    })
  } catch (err) {
    console.error("[GET /sellers/me]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch profile" })
  }
})

router.patch("/", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid
  if (!firebaseUid) {
    res.status(401).json({ error: "UNAUTHORIZED" })
    return
  }
  const { preferredLocale } = req.body as { preferredLocale?: string }
  if (preferredLocale === undefined) {
    res.status(400).json({ error: "VALIDATION_ERROR", details: ["preferredLocale must be provided"] })
    return
  }
  if (preferredLocale !== "ar" && preferredLocale !== "en") {
    res.status(400).json({ error: "VALIDATION_ERROR", details: ["preferredLocale must be 'ar' or 'en'"] })
    return
  }
  try {
    const db = await connectToMongo()
    const result = await db.collection("sellers").findOneAndUpdate(
      { firebaseUid },
      { $set: { preferredLocale, updatedAt: new Date() } },
      { returnDocument: "after" }
    )
    if (!result) {
      res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
      return
    }
    res.json({
      id: result._id,
      businessName: result.businessName,
      preferredLocale: result.preferredLocale ?? "ar",
    })
  } catch (err) {
    console.error("[PATCH /sellers/me]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update profile" })
  }
})

router.use(sellersAnalyticsRouter)
router.use(sellersProductsRouter)
router.use(sellersPaymentLinksRouter)

export default router
