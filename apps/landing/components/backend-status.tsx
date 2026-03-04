"use client"

import { useEffect, useState } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://backend.instacheckouteg.com"

export function BackendStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  )

  useEffect(() => {
    fetch(`${BACKEND_URL.replace(/\/$/, "")}/health`)
      .then((res) => (res.ok ? "connected" : "error"))
      .catch(() => "error")
      .then(setStatus)
  }, [])

  if (status === "checking") return null
  if (status === "error")
    return (
      <span className="text-xs text-amber-600" title="Backend unreachable">
        Backend: ✗
      </span>
    )
  return (
    <span className="text-xs text-emerald-600" title="Backend connected">
      Backend: ✓
    </span>
  )
}
