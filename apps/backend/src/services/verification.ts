import { connectToMongo } from "../db.js"
import { ObjectId } from "mongodb"

const OTP_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 3

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function createVerification(
  sellerId: ObjectId,
  whatsappNumber: string
): Promise<{ code: string; expiresAt: Date }> {
  const db = await connectToMongo()
  const coll = db.collection("verification_codes")
  const code = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
  const now = new Date()

  await coll.insertOne({
    sellerId,
    whatsappNumber,
    code,
    attempts: 0,
    expiresAt,
    createdAt: now,
  })

  console.log(`[Verification] OTP created for seller ${sellerId}, expires ${expiresAt.toISOString()}`)
  return { code, expiresAt }
}

export async function validateOtp(
  whatsappNumber: string,
  receivedCode: string
): Promise<{ ok: boolean; sellerId?: ObjectId; error?: string }> {
  const db = await connectToMongo()
  const coll = db.collection("verification_codes")
  const sellers = db.collection("sellers")

  const normalized = whatsappNumber.replace(/\D/g, "").replace(/^0/, "")
  const searchNumber = normalized.startsWith("20") ? normalized : `20${normalized.slice(-10)}`

  const pending = await coll.findOne(
    { whatsappNumber: searchNumber },
    { sort: { createdAt: -1 } }
  )

  if (!pending) {
    return { ok: false, error: "NO_PENDING_VERIFICATION" }
  }
  if (new Date() > pending.expiresAt) {
    return { ok: false, error: "EXPIRED" }
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "MAX_ATTEMPTS_EXCEEDED" }
  }

  await coll.updateOne(
    { _id: pending._id },
    { $inc: { attempts: 1 } }
  )

  if (pending.code !== receivedCode.trim()) {
    return { ok: false, error: "INVALID_CODE" }
  }

  await sellers.updateOne(
    { _id: pending.sellerId },
    { $set: { whatsappVerified: true, updatedAt: new Date() } }
  )

  console.log(`[Verification] Seller ${pending.sellerId} verified successfully`)
  return { ok: true, sellerId: pending.sellerId as ObjectId }
}

export function sendOtpViaWhatsApp(whatsappNumber: string, code: string): void {
  console.log(`[WhatsApp Stub] Sending OTP to ${whatsappNumber}: ${code}`)
  console.log(`[WhatsApp Stub] Message: "رمز التحقق Insta Checkout: ${code}. صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق."`)
}
