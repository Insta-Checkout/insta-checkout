import { connectToMongo } from "../db.js"
import { ObjectId } from "mongodb"

/** OTP codes expire after this many minutes. */
const OTP_EXPIRY_MINUTES = 5

/** Maximum OTP validation attempts before the code is permanently rejected. */
const MAX_ATTEMPTS = 3

/** Generates a cryptographically-insecure 6-digit OTP string (e.g. "482910"). */
function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * Creates a new OTP verification record for a seller.
 *
 * Inserts a document into `verification_codes` with the generated OTP,
 * an attempt counter starting at 0, and an expiry timestamp.
 *
 * @param sellerId - The MongoDB ObjectId of the seller requesting verification.
 * @param whatsappNumber - The seller's WhatsApp number in `20XXXXXXXXXX` format.
 * @returns The generated OTP code and its expiration date.
 */
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

/**
 * Validates an OTP code submitted by a seller.
 *
 * Looks up the most recent pending verification for the given WhatsApp number,
 * checks expiry and attempt limits, then compares codes. On success, marks the
 * seller's `whatsappVerified` flag as `true`.
 *
 * Phone number normalization: strips non-digits, drops leading "0", and ensures
 * the Egypt country prefix "20" is present (e.g. "01012345678" → "2001012345678").
 *
 * @param whatsappNumber - The WhatsApp number to look up (flexible format, will be normalized).
 * @param receivedCode - The 6-digit OTP code submitted by the seller.
 * @returns `{ ok: true, sellerId }` on success, or `{ ok: false, error }` with one of:
 *   - `NO_PENDING_VERIFICATION` — no OTP record found for this number.
 *   - `EXPIRED` — the OTP has passed its expiry window.
 *   - `MAX_ATTEMPTS_EXCEEDED` — too many failed attempts.
 *   - `INVALID_CODE` — the code doesn't match.
 */
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

/**
 * Sends an OTP code to the seller via WhatsApp.
 *
 * **Currently a stub** — logs the message to the console instead of calling
 * an external API. Replace with a real WhatsApp Business API or Twilio
 * integration before production use.
 *
 * @param whatsappNumber - The recipient's WhatsApp number.
 * @param code - The 6-digit OTP code to send.
 */
export function sendOtpViaWhatsApp(whatsappNumber: string, code: string): void {
  console.log(`[WhatsApp Stub] Sending OTP to ${whatsappNumber}: ${code}`)
  console.log(`[WhatsApp Stub] Message: "رمز التحقق Insta Checkout: ${code}. صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق."`)
}
