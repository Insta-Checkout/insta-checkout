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
    const instapayInfo = seller.instapayInfo ?? { method: null, mobile: null, bankName: null, bankAccountNumber: null, ipaAddress: null }
    const hasInstapayInfo = !!(instapayInfo.method)
    const hasSocialLinks = !!(seller.socialLinks?.instagram || seller.socialLinks?.facebook)
    const onboardingComplete = seller.onboardingComplete ?? (hasInstapayInfo && !!seller.maskedFullName && !!seller.category && hasSocialLinks)
    res.json({
      id: seller._id,
      fullName: seller.fullName ?? null,
      businessName: seller.businessName,
      preferredLocale: seller.preferredLocale ?? null,
      email: seller.email,
      whatsappNumber: seller.whatsappNumber ?? null,
      whatsappVerified: seller.whatsappVerified,
      category: seller.category ?? null,
      instapayInfo,
      instapayNumber: seller.instapayNumber ?? null,
      maskedFullName: seller.maskedFullName ?? null,
      logoUrl: seller.logoUrl ?? null,
      socialLinks: seller.socialLinks ?? { instagram: "", facebook: "", whatsapp: "" },
      onboardingComplete,
      onboardingProgress: seller.onboardingProgress ?? {
        category: !!seller.category,
        instapayInfo: hasInstapayInfo,
        instapayNumber: hasInstapayInfo || !!seller.instapayNumber,
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
  if (body.instapayInfo && typeof body.instapayInfo === "object") {
    const info = body.instapayInfo as Record<string, unknown>
    const method = typeof info.method === "string" ? info.method : null
    if (method === "mobile" || method === "bank" || method === "ipa") {
      updates.instapayInfo = {
        method,
        mobile: method === "mobile" && typeof info.mobile === "string" ? info.mobile.trim() : null,
        bankName: method === "bank" && typeof info.bankName === "string" ? info.bankName.trim() : null,
        bankAccountNumber: method === "bank" && typeof info.bankAccountNumber === "string" ? info.bankAccountNumber.trim() : null,
        ipaAddress: method === "ipa" && typeof info.ipaAddress === "string" ? info.ipaAddress.trim() : null,
      }
    }
  }
  // Legacy support
  if (typeof body.instapayNumber === "string" && body.instapayNumber.trim()) {
    updates.instapayNumber = body.instapayNumber.trim()
    // Auto-migrate to instapayInfo if not already set
    if (!updates.instapayInfo) {
      updates.instapayInfo = { method: "mobile", mobile: body.instapayNumber.trim(), bankName: null, bankAccountNumber: null, ipaAddress: null }
    }
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
    const mergedInstapayInfo = merged.instapayInfo as { method?: string } | undefined
    const hasInstapayInfo = !!(mergedInstapayInfo?.method)
    const mergedSocialLinks = merged.socialLinks as { instagram?: string; facebook?: string } | undefined
    const hasSocialLinks = !!(mergedSocialLinks?.instagram || mergedSocialLinks?.facebook)
    const requiredComplete = !!(hasInstapayInfo && merged.maskedFullName && merged.category && hasSocialLinks)
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
    const docInstapayInfo = doc.instapayInfo as { method?: string } | undefined
    res.json({
      id: doc._id,
      onboardingComplete: (doc.onboardingComplete as boolean) ?? requiredComplete,
      onboardingProgress: {
        category: !!doc.category,
        instapayInfo: !!(docInstapayInfo?.method),
        instapayNumber: !!(docInstapayInfo?.method) || !!doc.instapayNumber,
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
  if (body.instapayInfo && typeof body.instapayInfo === "object") {
    const info = body.instapayInfo as Record<string, unknown>
    const method = typeof info.method === "string" ? info.method : null
    if (method === "mobile" || method === "bank" || method === "ipa") {
      updates.instapayInfo = {
        method,
        mobile: method === "mobile" && typeof info.mobile === "string" ? info.mobile.trim() : null,
        bankName: method === "bank" && typeof info.bankName === "string" ? info.bankName.trim() : null,
        bankAccountNumber: method === "bank" && typeof info.bankAccountNumber === "string" ? info.bankAccountNumber.trim() : null,
        ipaAddress: method === "ipa" && typeof info.ipaAddress === "string" ? info.ipaAddress.trim() : null,
      }
    }
  }
  if (typeof body.maskedFullName === "string") {
    const val = body.maskedFullName.trim()
    if (!val || val.includes("*")) updates.maskedFullName = val || null
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
    const instapayInfo = result.instapayInfo as { method?: string } | undefined
    res.json({
      id: result._id,
      fullName: result.fullName ?? null,
      businessName: result.businessName,
      preferredLocale: result.preferredLocale ?? "ar",
      email: result.email,
      whatsappNumber: result.whatsappNumber ?? null,
      category: result.category ?? null,
      instapayInfo: result.instapayInfo ?? { method: null, mobile: null, bankName: null, bankAccountNumber: null, ipaAddress: null },
      maskedFullName: result.maskedFullName ?? null,
      logoUrl: result.logoUrl ?? null,
      socialLinks: result.socialLinks ?? { instagram: "", facebook: "", whatsapp: "" },
      onboardingComplete: result.onboardingComplete ?? false,
      onboardingProgress: {
        category: !!result.category,
        instapayInfo: !!(instapayInfo?.method),
        maskedName: !!result.maskedFullName,
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
