import { Router, Request, Response } from "express"
import { connectToMongo } from "../db.js"
import { createVerification, sendOtpViaWhatsApp } from "../services/verification.js"
import { ObjectId } from "mongodb"

const router = Router()

interface ValidationError {
  field: string
  message: string
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.startsWith("20") && cleaned.length === 12) return cleaned
  if (cleaned.startsWith("0") && cleaned.length === 11) return "20" + cleaned.slice(1)
  if (cleaned.length === 10) return "20" + cleaned
  return phone
}

function validateMinimalBody(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = []
  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : ""
  if (!businessName) {
    errors.push({ field: "businessName", message: "Business name is required" })
  } else if (businessName.length < 2 || businessName.length > 100) {
    errors.push({ field: "businessName", message: "Business name must be 2–100 characters" })
  }

  // Phone is optional for Google OAuth signup
  const phoneRaw = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : ""
  if (phoneRaw) {
    const normalized = normalizePhone(phoneRaw)
    if (!/^20[0-9]{10}$/.test(normalized)) {
      errors.push({ field: "phoneNumber", message: "Must be a valid Egyptian phone number (01XXXXXXXXX)" })
    }
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

function validateFullBody(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = []

  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : ""
  if (!businessName) {
    errors.push({ field: "businessName", message: "Business name is required" })
  } else if (businessName.length < 2 || businessName.length > 100) {
    errors.push({ field: "businessName", message: "Business name must be 2–100 characters" })
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

function validateBody(body: Record<string, unknown>): ValidationError[] {
  const hasMinimal = body.businessName != null && body.phoneNumber != null && body.firebaseUid != null && body.email != null
  const hasFull = body.instapayNumber != null && body.maskedFullName != null && body.whatsappNumber != null

  if (hasMinimal && !hasFull) {
    return validateMinimalBody(body)
  }
  return validateFullBody(body)
}

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", collection: "sellers" })
})

router.post("/", async (req: Request, res: Response) => {
  const start = Date.now()
  const body = req.body as Record<string, unknown>
  console.log("[POST /sellers] Request received", {
    businessName: body.businessName,
    phoneNumber: body.phoneNumber,
    email: body.email,
    firebaseUid: body.firebaseUid,
  })

  const errors = validateBody(body)
  if (errors.length > 0) {
    console.log("[POST /sellers] Validation failed", errors)
    res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: errors })
    return
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() || null : null
  const businessName = (body.businessName as string).trim()
  const category = typeof body.category === "string" ? (body.category as string).trim() || null : null
  const firebaseUid = (body.firebaseUid as string).trim()
  const email = (body.email as string).trim().toLowerCase()
  const socialLinks = (body.socialLinks as Record<string, string> | undefined) ?? {}

  const isMinimalSignup = body.instapayNumber == null
  const phoneRaw = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : ""
  const whatsappNumber = phoneRaw ? normalizePhone(phoneRaw) : null
  const instapayNumber = isMinimalSignup ? null : (body.instapayNumber as string).trim()
  const maskedFullName = isMinimalSignup ? null : (body.maskedFullName as string).trim()
  // New signups always start with onboardingComplete: false
  const onboardingComplete = false

  try {
    const db = await connectToMongo()
    const dbName = db.databaseName
    const sellers = db.collection("sellers")
    console.log("[POST /sellers] Using db:", dbName, "collection: sellers")

    const now = new Date()
    const doc: Record<string, unknown> = {
      fullName,
      businessName,
      category,
      instapayInfo: { method: null, mobile: null, bankName: null, bankAccountNumber: null, ipaAddress: null },
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
      onboardingComplete,
    }

    console.log("[POST /sellers] Inserting doc:", { email, whatsappNumber, businessName, firebaseUid })
    const result = await sellers.insertOne(doc)
    console.log(`[POST /sellers] Success in ${Date.now() - start}ms, id=${result.insertedId}, email=${email}, whatsappNumber=${whatsappNumber}, db=${dbName}`)

    if (!isMinimalSignup && whatsappNumber) {
      try {
        const { code } = await createVerification(result.insertedId as ObjectId, whatsappNumber)
        sendOtpViaWhatsApp(whatsappNumber, code)
      } catch (vErr) {
        console.warn("[POST /sellers] Verification OTP send failed:", vErr)
      }
    }

    res.status(201).json({
      success: true,
      seller: {
        _id: result.insertedId,
        fullName,
        businessName,
        category,
        instapayInfo: doc.instapayInfo,
        instapayNumber,
        maskedFullName,
        whatsappNumber,
        whatsappVerified: false,
        onboardingComplete,
        createdAt: now,
      },
      message: "Seller registered successfully.",
    })
  } catch (err) {
    const mongoErr = err as { code?: number; keyPattern?: Record<string, number> }
    console.log("[POST /sellers] Error caught", {
      code: mongoErr.code,
      keyPattern: mongoErr.keyPattern,
      message: (err as Error).message,
    })

    if (mongoErr.code === 11000) {
      const key = mongoErr.keyPattern ? Object.keys(mongoErr.keyPattern)[0] : ""
      console.log("[POST /sellers] Duplicate key", key)
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
