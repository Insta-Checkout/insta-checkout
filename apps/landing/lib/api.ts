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
