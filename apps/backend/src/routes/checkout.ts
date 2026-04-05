import { Router, Request, Response } from "express"
import { ObjectId } from "mongodb"
import multer from "multer"
import path from "path"
import fs from "fs"
import { writeFile } from "fs/promises"
import crypto from "crypto"
import { connectToMongo } from "../db.js"
import { API_BASE_URL } from "../config.js"
import { sendPaymentReceivedEmail } from "../services/email.js"

const router = Router()

function generateToken(): string {
  return crypto.randomBytes(9).toString("base64url")
}

// Multer: memory storage, 10MB limit (matches checkout step-two client validation)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads")
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

function validateEgyptianPhone(phone: string): boolean {
  return /^20[0-9]{10}$/.test(phone)
}

// GET /checkout/:token - public, no auth
router.get("/:token", async (req: Request, res: Response) => {
  const { token } = req.params
  if (!token) {
    res.status(400).json({ error: "INVALID_TOKEN", message: "Token is required" })
    return
  }

  try {
    const db = await connectToMongo()
    const paymentLinks = db.collection("payment_links")
    const sellers = db.collection("sellers")

    const paymentLink = await paymentLinks.findOne({ token })
    if (!paymentLink) {
      res.status(404).json({ error: "NOT_FOUND", message: "Payment link not found" })
      return
    }

    const status = paymentLink.status ?? "active"
    if (["cancelled", "paid", "expired", "preview"].includes(status)) {
      res.status(410).json({
        error: status === "preview" ? "LINK_PREVIEW" : "LINK_UNAVAILABLE",
        message: status === "preview" ? "This link is in preview mode" : `Payment link is ${status}`,
        status,
      })
      return
    }

    const expiresAt = paymentLink.expiresAt ? new Date(paymentLink.expiresAt) : null
    if (expiresAt && expiresAt < new Date()) {
      res.status(410).json({ error: "LINK_EXPIRED", message: "Payment link has expired", status: "expired" })
      return
    }

    const sellerId = paymentLink.sellerId
    const seller = sellerId
      ? await sellers.findOne({ _id: new ObjectId(sellerId.toString()) })
      : null

    if (!seller) {
      res.status(404).json({ error: "SELLER_NOT_FOUND", message: "Seller not found" })
      return
    }

    let productImageUrl: string | null = paymentLink.productImageUrl ?? null
    let productDescription: string | null = paymentLink.description ?? null
    if (paymentLink.productId && (!productImageUrl || productDescription === null)) {
      const product = await db.collection("products").findOne({ _id: paymentLink.productId })
      if (!productImageUrl) productImageUrl = product?.imageUrl ?? null
      if (productDescription === null) productDescription = product?.description ?? null
    }

    res.status(200).json({
      paymentLinkId: paymentLink._id,
      token: paymentLink.token,
      status: paymentLink.status ?? "active",
      product: {
        name: paymentLink.productName ?? "",


        price: paymentLink.price ?? 0,
        imageUrl: productImageUrl ?? undefined,
        description: productDescription ?? undefined,
      },
      seller: {
        businessName: seller.businessName || seller.fullName || "Seller",
        category: seller.category ?? null,
        instapayLink: seller.instapayLink ?? null,
        logoUrl: seller.branding?.logoUrl ?? seller.logoUrl ?? null,
        whatsappNumber: seller.whatsappNumber ?? "",
        plan: seller.plan ?? "free",
        branding: seller.branding ?? null,
      },
      expiresAt: expiresAt?.toISOString() ?? null,
      locale: seller.contentLocale ?? seller.preferredLocale ?? "en",
    })
  } catch (err) {
    console.error("[GET /checkout/:token]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch payment link" })
  }
})

// POST /checkout/:token/confirm - multipart: buyerPhone, buyerName, screenshot
router.post(
  "/:token/confirm",
  (req, res, next) => {
    upload.single("screenshot")(req, res, (err: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : "Upload failed"
        console.error("[POST /checkout/:token/confirm] multer error:", err)
        res.status(400).json({ error: "UPLOAD_ERROR", message: msg })
        return
      }
      next()
    })
  },
  async (req: Request, res: Response) => {
    const { token } = req.params
    if (!token) {
      res.status(400).json({ error: "INVALID_TOKEN", message: "Token is required" })
      return
    }

    const body = (req.body as Record<string, string>) ?? {}
    const buyerPhone = typeof body.buyerPhone === "string" ? body.buyerPhone.trim() : ""
    const buyerName = typeof body.buyerName === "string" ? body.buyerName.trim() || null : null
    const buyerEmail = typeof body.buyerEmail === "string" ? body.buyerEmail.trim().toLowerCase() : ""

    if (!buyerPhone) {
      res.status(400).json({ error: "VALIDATION_ERROR", details: [{ field: "buyerPhone", message: "Buyer phone is required" }] })
      return
    }

    if (!validateEgyptianPhone(buyerPhone)) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        details: [{ field: "buyerPhone", message: "Must be a valid Egyptian phone number (20XXXXXXXXXX)" }],
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!buyerEmail || !emailRegex.test(buyerEmail)) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        details: [{ field: "buyerEmail", message: "Valid email is required" }],
      })
      return
    }

    try {
      const db = await connectToMongo()
      const paymentLinks = db.collection("payment_links")

      const paymentLink = await paymentLinks.findOne({ token })
      if (!paymentLink) {
        res.status(404).json({ error: "NOT_FOUND", message: "Payment link not found" })
        return
      }

      const status = paymentLink.status ?? "active"
      if (status !== "active") {
        res.status(410).json({ error: "LINK_UNAVAILABLE", message: `Payment link is ${status}`, status })
        return
      }

      const expiresAt = paymentLink.expiresAt ? new Date(paymentLink.expiresAt) : null
      if (expiresAt && expiresAt < new Date()) {
        res.status(410).json({ error: "LINK_EXPIRED", message: "Payment link has expired", status: "expired" })
        return
      }

      let screenshotUrl: string | null = null
      const file = req.file
      if (file && file.buffer) {
        const ext = path.extname(file.originalname) || ".png"
        const filename = `${generateToken()}${ext}`
        const filepath = path.join(UPLOADS_DIR, filename)
        await writeFile(filepath, file.buffer)
        screenshotUrl = `${API_BASE_URL}/uploads/${filename}`
      }

      const now = new Date()
      await paymentLinks.updateOne(
        { token },
        {
          $set: {
            status: "paid",
            paidAt: now,
            buyerPhone,
            buyerEmail,
            buyerName: buyerName ?? null,
            screenshotUrl,
            updatedAt: now,
          },
        }
      )

      // Notify seller about new payment (non-blocking)
      const sellerId = paymentLink.sellerId
      if (sellerId) {
        ;(async () => {
          const sellers = db.collection("sellers")
          const seller = await sellers.findOne({ _id: new ObjectId(sellerId.toString()) })
          if (seller?.email) {
            const locale = (seller.contentLocale as "en" | "ar") ?? (seller.preferredLocale as "en" | "ar") ?? "en"
            await sendPaymentReceivedEmail(seller.email as string, locale, {
              productName: (paymentLink.productName as string) ?? "Payment",
              amount: (paymentLink.price as number) ?? 0,
              buyerPhone,
              paymentLinkId: paymentLink._id.toString(),
            })
          }
        })().catch((err) => {
          console.error("[POST /checkout/:token/confirm] Payment notification email failed:", err)
        })
      }

      res.status(201).json({
        status: "paid",
      })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error"
      console.error("[POST /checkout/:token/confirm]", err)
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: process.env.NODE_ENV !== "production" ? errMsg : "Failed to confirm payment",
      })
    }
  }
)

export default router
