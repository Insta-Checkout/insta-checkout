import { Router, Request, Response } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { writeFile } from "fs/promises"
import crypto from "crypto"
import { connectToMongo } from "../db.js"
import { API_BASE_URL } from "../config.js"
import { requireFirebaseAuth } from "../middleware/firebaseAuth.js"
import { resolveSellerContext } from "../middleware/resolveSellerContext.js"
import { ALL_PERMISSIONS } from "../permissions.js"
import sellersAnalyticsRouter from "./sellersAnalytics.js"
import sellersProductsRouter from "./sellersProducts.js"
import sellersPaymentLinksRouter from "./sellersPaymentLinks.js"
import sellersTeamRouter from "./sellersTeam.js"
import sellersInvitationsRouter from "./sellersInvitations.js"

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

const PRO_ONLY_BRANDING_FIELDS = ["coverPhotoUrl", "slogan", "sloganAr", "secondaryColor", "accentColor", "hidePoweredBy"] as const

const brandingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp"]
    cb(null, allowed.includes(file.mimetype))
  },
})

const BRANDING_UPLOADS_DIR = path.join(process.cwd(), "uploads", "branding")
if (!fs.existsSync(BRANDING_UPLOADS_DIR)) {
  fs.mkdirSync(BRANDING_UPLOADS_DIR, { recursive: true })
}

const router = Router()
router.use(requireFirebaseAuth)
router.use(resolveSellerContext)

/** Debug: returns current Firebase UID from token and seller context. */
router.get("/debug", async (req: Request, res: Response) => {
  const ctx = req.sellerContext!
  try {
    const db = await connectToMongo()
    const seller = await db.collection("sellers").findOne({ _id: ctx.sellerId })
    res.json({
      firebaseUid: req.firebaseUid,
      isOwner: ctx.isOwner,
      permissions: ctx.permissions,
      sellerFound: !!seller,
      sellerEmail: seller?.email ?? null,
      sellerBusinessName: seller?.businessName ?? null,
    })
  } catch (err) {
    console.error("[GET /sellers/me/debug]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
  }
})

router.get("/", async (req: Request, res: Response) => {
  const ctx = req.sellerContext!
  try {
    const db = await connectToMongo()
    const seller = await db.collection("sellers").findOne({ _id: ctx.sellerId })
    if (!seller) {
      res.status(404).json({ error: "NOT_FOUND", message: "Seller not found" })
      return
    }
    const hasSocialLinks = !!(seller.socialLinks?.instagram || seller.socialLinks?.facebook)
    const onboardingComplete = seller.onboardingComplete ?? (!!seller.instapayLink && !!seller.category && hasSocialLinks)

    // Role context for frontend permission-gating
    const roleLabel = ctx.isOwner
      ? "Owner"
      : (await db.collection("memberships").findOne({ _id: ctx.membershipId }))?.roleLabel ?? "Custom"

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
      approvalStatus: seller.approvalStatus ?? "approved",
      approvalNote: seller.approvalNote ?? null,
      plan: seller.plan ?? "free",
      branding: seller.branding ?? null,
      role: {
        isOwner: ctx.isOwner,
        permissions: ctx.permissions,
        roleLabel,
      },
    })
  } catch (err) {
    console.error("[GET /sellers/me]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch profile" })
  }
})

router.patch("/onboarding", async (req: Request, res: Response) => {
  const ctx = req.sellerContext!
  if (!ctx.isOwner) {
    res.status(403).json({ error: "FORBIDDEN", message: "Only the account owner can update onboarding" })
    return
  }
  const firebaseUid = req.firebaseUid!
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
  const ctx = req.sellerContext!
  if (!ctx.isOwner) {
    res.status(403).json({ error: "FORBIDDEN", message: "Only the account owner can update the profile" })
    return
  }
  const firebaseUid = req.firebaseUid!
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

  // Handle branding fields with pro-gating
  if (body.branding && typeof body.branding === "object") {
    const branding = body.branding as Record<string, unknown>
    const db = await connectToMongo()
    const seller = await db.collection("sellers").findOne({ firebaseUid })
    const plan = seller?.plan ?? "free"

    // Check for pro-only fields
    const proFieldsInRequest = PRO_ONLY_BRANDING_FIELDS.filter(f => branding[f] !== undefined)
    if (plan !== "pro" && proFieldsInRequest.length > 0) {
      res.status(403).json({
        error: "PRO_REQUIRED",
        message: `The following branding fields require a Pro plan: ${proFieldsInRequest.join(", ")}`,
      })
      return
    }

    // Validate and set free-tier fields
    if (typeof branding.logoUrl === "string") {
      updates["branding.logoUrl"] = branding.logoUrl.trim() || null
    }
    if (typeof branding.primaryColor === "string") {
      const val = branding.primaryColor.trim()
      if (!val) {
        updates["branding.primaryColor"] = null
      } else if (HEX_COLOR_RE.test(val)) {
        updates["branding.primaryColor"] = val
      }
    }

    // Pro-only fields (already gated above)
    if (plan === "pro") {
      if (typeof branding.coverPhotoUrl === "string") {
        updates["branding.coverPhotoUrl"] = branding.coverPhotoUrl.trim() || null
      }
      if (typeof branding.slogan === "string") {
        const val = branding.slogan.trim()
        updates["branding.slogan"] = val.length <= 80 ? val || null : null
      }
      if (typeof branding.sloganAr === "string") {
        const val = branding.sloganAr.trim()
        updates["branding.sloganAr"] = val.length <= 80 ? val || null : null
      }
      if (typeof branding.secondaryColor === "string") {
        const val = branding.secondaryColor.trim()
        if (!val) updates["branding.secondaryColor"] = null
        else if (HEX_COLOR_RE.test(val)) updates["branding.secondaryColor"] = val
      }
      if (typeof branding.accentColor === "string") {
        const val = branding.accentColor.trim()
        if (!val) updates["branding.accentColor"] = null
        else if (HEX_COLOR_RE.test(val)) updates["branding.accentColor"] = val
      }
      if (typeof branding.hidePoweredBy === "boolean") {
        updates["branding.hidePoweredBy"] = branding.hidePoweredBy
      }
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
      plan: result.plan ?? "free",
      branding: result.branding ?? null,
    })
  } catch (err) {
    console.error("[PATCH /sellers/me]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update profile" })
  }
})

// POST /sellers/me/branding/upload — upload logo or cover photo
router.post(
  "/branding/upload",
  (req, res, next) => {
    brandingUpload.single("file")(req, res, (err: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : "Upload failed"
        res.status(400).json({ error: "UPLOAD_ERROR", message: msg })
        return
      }
      next()
    })
  },
  async (req: Request, res: Response) => {
    const ctx = req.sellerContext!
    if (!ctx.isOwner) {
      res.status(403).json({ error: "FORBIDDEN", message: "Only the account owner can upload branding assets" })
      return
    }

    const file = req.file
    if (!file || !file.buffer) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "No file provided" })
      return
    }

    const type = (req.body as Record<string, string>)?.type
    if (type !== "logo" && type !== "cover") {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "Type must be 'logo' or 'cover'" })
      return
    }

    // Cover photos are pro-only
    if (type === "cover") {
      const db = await connectToMongo()
      const seller = await db.collection("sellers").findOne({ _id: ctx.sellerId })
      if ((seller?.plan ?? "free") !== "pro") {
        res.status(403).json({ error: "PRO_REQUIRED", message: "Cover photo uploads require a Pro plan" })
        return
      }
    }

    try {
      const sellerDir = path.join(BRANDING_UPLOADS_DIR, ctx.sellerId.toString())
      if (!fs.existsSync(sellerDir)) {
        fs.mkdirSync(sellerDir, { recursive: true })
      }

      const ext = path.extname(file.originalname) || ".png"
      const token = crypto.randomBytes(9).toString("base64url")
      const filename = `${type}-${token}${ext}`
      const filepath = path.join(sellerDir, filename)
      await writeFile(filepath, file.buffer)

      const fileUrl = `${API_BASE_URL}/uploads/branding/${ctx.sellerId}/${filename}`

      // Auto-update the branding field
      const db = await connectToMongo()
      const brandingField = type === "logo" ? "branding.logoUrl" : "branding.coverPhotoUrl"
      await db.collection("sellers").updateOne(
        { _id: ctx.sellerId },
        { $set: { [brandingField]: fileUrl, updatedAt: new Date() } }
      )

      res.json({ url: fileUrl })
    } catch (err) {
      console.error("[POST /sellers/me/branding/upload]", err)
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to upload file" })
    }
  }
)

router.use(sellersAnalyticsRouter)
router.use(sellersProductsRouter)
router.use(sellersPaymentLinksRouter)
router.use(sellersTeamRouter)
router.use(sellersInvitationsRouter)

export default router
