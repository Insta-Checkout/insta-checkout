export const CHECKOUT_BASE_URL =
  process.env.CHECKOUT_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://pay.instacheckouteg.com"
    : "http://localhost:3001")

export const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000"

export const LANDING_BASE_URL =
  process.env.LANDING_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://instacheckouteg.com"
    : "http://localhost:3000")

export const WHATSAPP_SUPPORT_URL =
  process.env.WHATSAPP_SUPPORT_URL ?? "https://wa.me/201000000000"
