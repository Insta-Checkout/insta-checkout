import { Router, Request, Response } from "express"
import { connectToMongo } from "../db.js"

const router = Router()

const VALID_CATEGORIES = [
  "Food & Desserts",
  "Clothing",
  "Services",
  "Electronics",
  "Other",
]

interface ValidationError {
  field: string
  message: string
}

function validateBody(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = []

  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : ""
  if (!businessName) {
    errors.push({ field: "businessName", message: "Business name is required" })
  } else if (businessName.length < 2 || businessName.length > 100) {
    errors.push({ field: "businessName", message: "Business name must be 2–100 characters" })
  }

  const category = typeof body.category === "string" ? body.category.trim() : ""
  if (!category) {
    errors.push({ field: "category", message: "Category is required" })
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push({ field: "category", message: `Category must be one of: ${VALID_CATEGORIES.join(", ")}` })
  }

  const instapayNumber = typeof body.instapayNumber === "string" ? body.instapayNumber.trim() : ""
  if (!instapayNumber) {
    errors.push({ field: "instapayNumber", message: "InstaPay number is required" })
  }

  const maskedFullName = typeof body.maskedFullName === "string" ? body.maskedFullName.trim() : ""
  if (!maskedFullName) {
    errors.push({ field: "maskedFullName", message: "Masked full name is required" })
  } else if (!maskedFullName.includes("*")) {
    errors.push({ field: "maskedFullName", message: "Masked full name must contain at least one * character" })
  }

  const whatsappNumber = typeof body.whatsappNumber === "string" ? body.whatsappNumber.trim() : ""
  if (!whatsappNumber) {
    errors.push({ field: "whatsappNumber", message: "WhatsApp number is required" })
  } else if (!/^20[0-9]{10}$/.test(whatsappNumber)) {
    errors.push({ field: "whatsappNumber", message: "Must be a valid Egyptian phone number (20XXXXXXXXXX)" })
  }

  const firebaseUid = typeof body.firebaseUid === "string" ? body.firebaseUid.trim() : ""
  if (!firebaseUid) {
    errors.push({ field: "firebaseUid", message: "Firebase UID is required" })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: "email", message: "Email must be a valid format" })
  }

  return errors
}

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", collection: "sellers" })
})

router.post("/", async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>

  const errors = validateBody(body)
  if (errors.length > 0) {
    res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: errors })
    return
  }

  const businessName = (body.businessName as string).trim()
  const category = (body.category as string).trim()
  const instapayNumber = (body.instapayNumber as string).trim()
  const maskedFullName = (body.maskedFullName as string).trim()
  const whatsappNumber = (body.whatsappNumber as string).trim()
  const firebaseUid = (body.firebaseUid as string).trim()
  const email = (body.email as string).trim().toLowerCase()
  const socialLinks = (body.socialLinks as Record<string, string> | undefined) ?? {}

  try {
    const db = await connectToMongo()
    const sellers = db.collection("sellers")

    // Ensure unique indexes exist
    await sellers.createIndex({ firebaseUid: 1 }, { unique: true, sparse: false })
    await sellers.createIndex({ email: 1 }, { unique: true, sparse: false })
    await sellers.createIndex({ whatsappNumber: 1 }, { unique: true, sparse: false })

    const now = new Date()
    const doc = {
      businessName,
      category,
      instapayNumber,
      maskedFullName,
      whatsappNumber,
      firebaseUid,
      email,
      whatsappVerified: false,
      logoUrl: null,
      socialLinks: {
        instagram: socialLinks.instagram ?? "",
        facebook: socialLinks.facebook ?? "",
        whatsapp: socialLinks.whatsapp ?? "",
      },
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
    }

    const result = await sellers.insertOne(doc)

    res.status(201).json({
      success: true,
      seller: {
        _id: result.insertedId,
        businessName,
        category,
        instapayNumber,
        maskedFullName,
        whatsappNumber,
        whatsappVerified: false,
        createdAt: now,
      },
      message: "Seller registered successfully.",
    })
  } catch (err) {
    const mongoErr = err as { code?: number; keyPattern?: Record<string, number> }

    if (mongoErr.code === 11000) {
      const key = mongoErr.keyPattern ? Object.keys(mongoErr.keyPattern)[0] : ""
      if (key === "email" || key === "firebaseUid") {
        res.status(409).json({
          success: false,
          error: "DUPLICATE_EMAIL",
          message: "A seller with this email already exists.",
        })
        return
      }
      res.status(409).json({
        success: false,
        error: "DUPLICATE_WHATSAPP",
        message: "A seller with this WhatsApp number already exists.",
      })
      return
    }

    console.error("[POST /sellers] Unexpected error:", err)
    res.status(500).json({
      success: false,
      error: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
    })
  }
})

export default router
