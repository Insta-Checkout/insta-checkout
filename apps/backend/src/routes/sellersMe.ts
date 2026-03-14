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
    const hasSocialLinks = !!(seller.socialLinks?.instagram || seller.socialLinks?.facebook)
    const onboardingComplete = seller.onboardingComplete ?? (!!seller.instapayLink && !!seller.category && hasSocialLinks)
    res.json({
      id: seller._id,
      fullName: seller.fullName ?? null,
      businessName: seller.businessName,
      preferredLocale: seller.preferredLocale ?? null,
      email: seller.email,
      whatsappNumber: seller.whatsappNumber ?? null,
      whatsappVerified: seller.whatsappVerified,
      category: seller.category ?? null,
      instapayLink: seller.instapayLink ?? null,
      logoUrl: seller.logoUrl ?? null,
      socialLinks: seller.socialLinks ?? { instagram: "", facebook: "", whatsapp: "" },
      onboardingComplete,
      onboardingProgress: {
        category: !!seller.category,
        instapayLink: !!seller.instapayLink,
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
  if (typeof body.fullName === "string") {
    updates.fullName = body.fullName.trim() || null
  }
  if (typeof body.businessName === "string" && body.businessName.trim()) {
    const val = body.businessName.trim()
    if (val.length >= 2 && val.length <= 100) updates.businessName = val
  }
  if (typeof body.whatsappNumber === "string") {
    const val = body.whatsappNumber.trim()
    if (!val) {
      updates.whatsappNumber = null
    } else if (/^20[0-9]{10}$/.test(val)) {
      updates.whatsappNumber = val
    }
  }
  if (typeof body.category === "string" && body.category.trim()) {
    updates.category = body.category.trim()
  }
  if (typeof body.instapayLink === "string") {
    const val = body.instapayLink.trim()
    if (val) {
      try {
        const url = new URL(val)
        if (url.hostname === "ipn.eg" || url.hostname === "instapay.eg") {
          updates.instapayLink = val
        }
      } catch { /* ignore invalid URLs */ }
    } else {
      updates.instapayLink = null
    }
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
    const mergedSocialLinks = merged.socialLinks as { instagram?: string; facebook?: string } | undefined
    const hasSocialLinks = !!(mergedSocialLinks?.instagram || mergedSocialLinks?.facebook)
    const requiredComplete = !!(merged.instapayLink && merged.category && hasSocialLinks)
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
        instapayLink: !!doc.instapayLink,
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
  const body = req.body as Record<string, unknown>
  const updates: Record<string, unknown> = {}

  if (typeof body.preferredLocale === "string") {
    if (body.preferredLocale !== "ar" && body.preferredLocale !== "en") {
      res.status(400).json({ error: "VALIDATION_ERROR", details: ["preferredLocale must be 'ar' or 'en'"] })
      return
    }
    updates.preferredLocale = body.preferredLocale
  }
  if (typeof body.fullName === "string") {
    updates.fullName = body.fullName.trim() || null
  }
  if (typeof body.businessName === "string" && body.businessName.trim()) {
    const val = body.businessName.trim()
    if (val.length >= 2 && val.length <= 100) updates.businessName = val
  }
  if (typeof body.whatsappNumber === "string") {
    const val = body.whatsappNumber.trim()
    if (!val) {
      updates.whatsappNumber = null
    } else if (/^20[0-9]{10}$/.test(val)) {
      updates.whatsappNumber = val
    }
  }
  if (typeof body.category === "string") {
    updates.category = body.category.trim() || null
  }
  if (typeof body.instapayLink === "string") {
    const val = body.instapayLink.trim()
    if (val) {
      try {
        const url = new URL(val)
        if (url.hostname === "ipn.eg" || url.hostname === "instapay.eg") {
          updates.instapayLink = val
        }
      } catch { /* ignore invalid URLs */ }
    } else {
      updates.instapayLink = null
    }
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
    res.status(400).json({ error: "VALIDATION_ERROR", details: ["No valid fields provided"] })
    return
  }

  try {
    const db = await connectToMongo()
    updates.updatedAt = new Date()
    const result = await db.collection("sellers").findOneAndUpdate(
      { firebaseUid },
      { $set: updates },
      { returnDocument: "after" }
    )
    if (!result) {
      res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
      return
    }
    res.json({
      id: result._id,
      fullName: result.fullName ?? null,
      businessName: result.businessName,
      preferredLocale: result.preferredLocale ?? "ar",
      email: result.email,
      whatsappNumber: result.whatsappNumber ?? null,
      category: result.category ?? null,
      instapayLink: result.instapayLink ?? null,
      logoUrl: result.logoUrl ?? null,
      socialLinks: result.socialLinks ?? { instagram: "", facebook: "", whatsapp: "" },
      onboardingComplete: result.onboardingComplete ?? false,
      onboardingProgress: {
        category: !!result.category,
        instapayLink: !!result.instapayLink,
        logo: !!result.logoUrl,
        socialLinks: !!(result.socialLinks?.instagram || result.socialLinks?.facebook || result.socialLinks?.whatsapp),
      },
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
