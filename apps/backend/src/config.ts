export const CHECKOUT_BASE_URL =
  process.env.CHECKOUT_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://pay.instacheckouteg.com"
    : "http://localhost:3001")

export const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000"
