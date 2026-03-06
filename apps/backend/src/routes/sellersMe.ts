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
    const onboardingComplete = seller.onboardingComplete ?? !!seller.instapayNumber
    res.json({
      id: seller._id,
      businessName: seller.businessName,
      preferredLocale: seller.preferredLocale ?? null,
      email: seller.email,
      whatsappVerified: seller.whatsappVerified,
      category: seller.category ?? null,
      instapayNumber: seller.instapayNumber ?? null,
      maskedFullName: seller.maskedFullName ?? null,
      onboardingComplete,
      onboardingProgress: seller.onboardingProgress ?? {
        category: !!seller.category,
        instapayNumber: !!seller.instapayNumber,
        maskedName: !!seller.maskedFullName,
        logo: !!seller.logoUrl,
        socialLinks: !!(seller.socialLinks?.instagram || seller.socialLinks?.facebook || seller.socialLinks?.whatsapp),
      },
    })
  } catch (err) {
    console.error("[GET /sellers/me]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch profile" })
  }
})

router.patch("/onboarding", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid
  if (!firebaseUid) {
    res.status(401).json({ error: "UNAUTHORIZED" })
    return
  }
  const body = req.body as Record<string, unknown>
  const updates: Record<string, unknown> = {}
  if (typeof body.category === "string" && body.category.trim()) {
    updates.category = body.category.trim()
  }
  if (typeof body.instapayNumber === "string" && body.instapayNumber.trim()) {
    updates.instapayNumber = body.instapayNumber.trim()
  }
  if (typeof body.maskedFullName === "string" && body.maskedFullName.trim()) {
    const val = body.maskedFullName.trim()
    if (val.includes("*")) updates.maskedFullName = val
  }
  if (typeof body.logoUrl === "string") {
    updates.logoUrl = body.logoUrl.trim() || null
  }
  if (body.socialLinks && typeof body.socialLinks === "object") {
    const sl = body.socialLinks as Record<string, string>
    updates.socialLinks = {
      instagram: typeof sl.instagram === "string" ? sl.instagram : "",
      facebook: typeof sl.facebook === "string" ? sl.facebook : "",
      whatsapp: typeof sl.whatsapp === "string" ? sl.whatsapp : "",
    }
  }
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: "No valid onboarding fields provided" })
    return
  }
  try {
    const db = await connectToMongo()
    const seller = await db.collection("sellers").findOne({ firebaseUid })
    if (!seller) {
      res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
      return
    }
    const now = new Date()
    const merged = { ...seller, ...updates, updatedAt: now } as Record<string, unknown>
    const requiredComplete = !!(merged.instapayNumber && merged.maskedFullName && merged.category)
    updates.onboardingComplete = requiredComplete
    updates.updatedAt = now

    const result = await db.collection("sellers").findOneAndUpdate(
      { firebaseUid },
      { $set: updates },
      { returnDocument: "after" }
    )
    if (!result) {
      res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
      return
    }
    if (requiredComplete) {
      await db.collection("payment_links").updateMany(
        { sellerId: result._id, status: "preview" },
        { $set: { status: "active", updatedAt: now } }
      )
    }
    const doc = result as Record<string, unknown>
    res.json({
      id: doc._id,
      onboardingComplete: (doc.onboardingComplete as boolean) ?? requiredComplete,
      onboardingProgress: {
        category: !!doc.category,
        instapayNumber: !!doc.instapayNumber,
        maskedName: !!doc.maskedFullName,
        logo: !!(doc.logoUrl as string | undefined),
        socialLinks: (() => {
          const sl = doc.socialLinks as { instagram?: string; facebook?: string; whatsapp?: string } | undefined
          return !!(sl?.instagram || sl?.facebook || sl?.whatsapp)
        })(),
      },
    })
  } catch (err) {
    console.error("[PATCH /sellers/me/onboarding]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update onboarding" })
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
