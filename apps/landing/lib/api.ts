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

/** Fetch with Firebase auth token. Pass a function that returns the idToken. */
export async function apiFetch(
  path: string,
  options: RequestInit & { getToken?: () => Promise<string | null> } = {}
): Promise<Response> {
  const { getToken, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers)

  if (getToken) {
    const token = await getToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  return fetch(`${getBackendUrl()}${path}`, {
    ...fetchOptions,
    headers,
  })
}
