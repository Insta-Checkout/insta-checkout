/**
 * Backend API client for admin dashboard.
 */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://backend.instacheckouteg.com"

export function getBackendUrl(): string {
  return BACKEND_URL.replace(/\/$/, "")
}

/** Fetch with Firebase ID token for authenticated backend calls. */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<Response> {
  const token = await getToken()
  const headers = new Headers(options.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  return fetch(url, { ...options, headers })
}
