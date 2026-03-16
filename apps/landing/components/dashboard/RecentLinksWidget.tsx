"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Link2, Check, ArrowRight, Loader2, RefreshCw } from "lucide-react"
import { auth } from "@/lib/firebase"
import { getBackendUrl, fetchWithAuth } from "@/lib/api"
import { useTranslations } from "@/lib/locale-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

type PaymentLinkStatus = "active" | "preview" | "paid" | "confirmed" | "expired" | "cancelled"

type PaymentLink = {
  id: string
  productName: string
  productNameAr?: string | null
  productNameEn?: string | null
  price: number
  status: PaymentLinkStatus
  createdAt: string
  paidAt: string | null
  buyerPhone: string | null
  buyerName: string | null
  screenshotUrl: string | null
}

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  active: { color: "text-[#7C3AED]", bg: "bg-[#EDE9FE]" },
  paid: { color: "text-[#D97706]", bg: "bg-[#FEF3C7]" },
  confirmed: { color: "text-[#10B981]", bg: "bg-[#D1FAE5]" },
  expired: { color: "text-[#6B7280]", bg: "bg-[#F3F4F6]" },
  cancelled: { color: "text-[#EF4444]", bg: "bg-[#FEE2E2]" },
  preview: { color: "text-[#6B7280]", bg: "bg-[#F3F4F6]" },
}

function formatRelativeTime(dateStr: string, locale: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (locale === "ar") {
    if (diffMin < 1) return "الآن"
    if (diffMin < 60) return `من ${diffMin} د`
    if (diffHr < 24) return `من ${diffHr} س`
    if (diffDay < 7) return `من ${diffDay} ي`
    return new Date(dateStr).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })
  }

  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString("en-GB", { month: "short", day: "numeric" })
}

function formatEgp(n: number, locale: string): string {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
  return `${formatted} ${locale === "ar" ? "ج.م" : "EGP"}`
}

export function RecentLinksWidget(): React.JSX.Element {
  const { t, locale } = useTranslations()
  const [links, setLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const getToken = useCallback(
    (): Promise<string | null> =>
      auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null),
    []
  )

  const fetchLinks = useCallback(
    async (showRefresh = false): Promise<void> => {
      if (showRefresh) setRefreshing(true)
      try {
        const res = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me/payment-links?limit=5&page=1`,
          {},
          getToken
        )
        if (res.ok) {
          const data = await res.json()
          setLinks(data.items ?? [])
        }
      } catch {
        // Widget is non-critical — fail silently
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [getToken]
  )

  useEffect(() => {
    fetchLinks()
    const handleVisibility = (): void => {
      if (document.visibilityState === "visible") fetchLinks()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [fetchLinks])

  const handleConfirm = async (linkId: string): Promise<void> => {
    const previousLinks = [...links]
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, status: "confirmed" as const } : l))
    )
    setConfirmingId(linkId)

    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/payment-links/${linkId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "confirm" }),
        },
        getToken
      )
      if (!res.ok) {
        setLinks(previousLinks)
        toast.error(t("dashboard.recentLinks.confirmFailed"))
      } else {
        toast.success(t("dashboard.recentLinks.confirmSuccess"))
      }
    } catch {
      setLinks(previousLinks)
      toast.error(t("dashboard.recentLinks.confirmFailed"))
    } finally {
      setConfirmingId(null)
    }
  }

  const statusLabels: Record<string, string> = {
    active: t("dashboard.links.active"),
    paid: t("dashboard.links.paid"),
    confirmed: t("dashboard.links.confirmed"),
    expired: t("dashboard.links.expired"),
    cancelled: t("dashboard.links.cancelled"),
    preview: t("dashboard.links.preview"),
  }

  const paidCount = links.filter((l) => l.status === "paid").length

  return (
    <Card className="border-[#E4D8F0] shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDE9FE]">
              <Link2 className="h-4 w-4 text-[#7C3AED]" aria-hidden="true" />
            </div>
            <CardTitle className="font-cairo text-[#1E0A3C]">
              {t("dashboard.recentLinks.title")}
            </CardTitle>
            {paidCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FEF3C7] px-1.5 text-xs font-bold text-[#D97706]">
                {paidCount}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchLinks(true)}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B5B7B] hover:bg-[#F3EEFA] hover:text-[#7C3AED] transition-colors cursor-pointer"
            aria-label={t("dashboard.recentLinks.refresh")}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-[#EDE9FE] p-3">
              <Link2 className="h-6 w-6 text-[#7C3AED]" aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-[#1E0A3C] font-cairo">
              {t("dashboard.recentLinks.emptyTitle")}
            </h3>
            <p className="mb-4 max-w-xs text-xs text-[#6B5B7B] font-cairo">
              {t("dashboard.recentLinks.emptySubtitle")}
            </p>
            <Link href="/dashboard/links">
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white hover:bg-[#6D28D9] transition-colors cursor-pointer">
                <Link2 className="h-3.5 w-3.5" />
                {t("dashboard.recentLinks.createFirst")}
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => {
              const style = STATUS_STYLES[link.status] ?? STATUS_STYLES.active
              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border border-[#E4D8F0] px-3 py-2.5 bg-white hover:bg-[#F3EEFA] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#1E0A3C] font-cairo truncate">
                      {locale === "ar"
                        ? link.productNameAr || link.productName
                        : link.productNameEn || link.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}
                      >
                        {statusLabels[link.status] ?? link.status}
                      </span>
                      <span className="text-xs text-[#6B5B7B] font-cairo">
                        {formatRelativeTime(link.createdAt, locale)}
                      </span>
                    </div>
                    {link.status === "paid" && (link.buyerName || link.buyerPhone) && (
                      <p className="text-xs text-[#6B5B7B] mt-0.5 font-cairo truncate">
                        {link.buyerName && link.buyerPhone
                          ? `${link.buyerName} — ${link.buyerPhone}`
                          : link.buyerName || link.buyerPhone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 ms-3">
                    <span className="font-mono text-sm font-bold text-[#1E0A3C]">
                      {formatEgp(link.price, locale)}
                    </span>
                    {link.status === "paid" && (
                      <button
                        onClick={() => handleConfirm(link.id)}
                        disabled={confirmingId === link.id}
                        className="flex items-center gap-1 rounded-lg bg-[#10B981] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#059669] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {confirmingId === link.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        {t("dashboard.recentLinks.confirm")}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E4D8F0]">
            <Link
              href="/dashboard/links"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors cursor-pointer"
            >
              {t("dashboard.recentLinks.viewAll")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
