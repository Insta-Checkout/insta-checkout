/**
 * Backend API client.
 * Set NEXT_PUBLIC_BACKEND_URL in your environment (default: production backend).
 */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://backend.instacheckouteg.com"

export function getBackendUrl(): string {
  return BACKEND_URL.replace(/\/$/, "")
}

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${getBackendUrl()}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

export interface CheckoutData {
  paymentLinkId: string
  token: string
  status: string
  product: { name: string; price: number; imageUrl?: string; description?: string }
  seller: {
    businessName: string
    category: string | null
    instapayLink: string | null
    logoUrl: string | null
    whatsappNumber: string
    plan?: string
    branding?: {
      logoUrl?: string | null
      primaryColor?: string | null
      coverPhotoUrl?: string | null
      slogan?: string | null
      sloganAr?: string | null
      backgroundColor?: string | null
      hidePoweredBy?: boolean
    } | null
  }
  expiresAt: string | null
  locale: string
}

export async function fetchCheckoutData(token: string): Promise<
  | { ok: true; data: CheckoutData }
  | { ok: false; status: number; error: string; message: string; linkStatus?: string }
> {
  const res = await fetch(`${getBackendUrl()}/checkout/${token}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: body.error ?? "UNKNOWN",
      message: body.message ?? "",
      linkStatus: body.status,
    }
  }
  return { ok: true, data: body }
}

export async function confirmPayment(
  token: string,
  data: { buyerPhone: string; buyerName?: string; buyerEmail: string; screenshot?: File }
): Promise<{ status?: string; error?: string; message?: string }> {
  const formData = new FormData()
  formData.append("buyerPhone", data.buyerPhone)
  formData.append("buyerEmail", data.buyerEmail)
  if (data.buyerName) formData.append("buyerName", data.buyerName)
  if (data.screenshot) formData.append("screenshot", data.screenshot)

  try {
    const res = await fetch(`${getBackendUrl()}/checkout/${token}/confirm`, {
      method: "POST",
      body: formData,
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        error: body.error ?? "UNKNOWN",
        message: body.message ?? "Something went wrong",
      }
    }
    return body
  } catch (err) {
    console.error("[confirmPayment] fetch failed:", err)
    return {
      error: "NETWORK_ERROR",
      message: "Could not reach the server. Please check your connection and try again.",
    }
  }
}
