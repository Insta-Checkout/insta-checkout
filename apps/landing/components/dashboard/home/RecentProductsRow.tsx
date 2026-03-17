"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { Zap, Link2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { fetchWithAuth, getBackendUrl } from "@/lib/api"
import { useTranslations } from "@/lib/locale-provider"
import { Skeleton } from "@/components/ui/skeleton"
import type { QuickProduct } from "@/components/dashboard/QuickProductsRow"

type RecentProductsRowProps = {
  products: QuickProduct[]
  loading: boolean
  onQuickLinkClick: () => void
}

function getDisplayName(p: QuickProduct, locale: string): string {
  if (locale === "ar") return p.nameAr || p.name
  return p.nameEn || p.name
}

function formatPrice(n: number, egpShort: string, locale: string): string {
  return (
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n) +
    " " +
    egpShort
  )
}

export function RecentProductsRow({
  products,
  loading,
  onQuickLinkClick,
}: RecentProductsRowProps): React.JSX.Element {
  const { t, locale } = useTranslations()
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const egpShort = t("common.egpShort")

  const displayProducts = products.filter((p) => p.status === "active").slice(0, 10)

  const getToken = useCallback(
    (): Promise<string | null> =>
      auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null),
    []
  )

  const handleGenerateLink = async (product: QuickProduct): Promise<void> => {
    setGeneratingId(product.id)
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/products/${product.id}/payment-links`,
        { method: "POST" },
        getToken
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || t("dashboard.products.createLinkFailed"))
      }
      const data = await res.json()
      try {
        await navigator.clipboard.writeText(data.checkoutUrl)
        toast.success(t("dashboard.products.linkCopied"))
      } catch {
        toast.success(t("dashboard.home.linkGenerated"))
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.products.error"))
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-[#1E0A3C] font-cairo">
        {t("dashboard.home.recentProducts")}
      </h3>

      <div
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Quick Link CTA card — always first */}
        <button
          onClick={onQuickLinkClick}
          className="shrink-0 w-40 rounded-xl border-2 border-dashed border-[#7C3AED]/40 bg-[#F3EEFA] p-4 flex flex-col items-center justify-center gap-2 hover:border-[#7C3AED] hover:bg-[#EDE9FE] transition-colors cursor-pointer snap-start"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE9FE]">
            <Zap className="h-5 w-5 text-[#7C3AED]" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-[#7C3AED] font-cairo">
            {t("dashboard.home.createQuickLink")}
          </span>
        </button>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="shrink-0 w-40 h-[140px] rounded-xl" />
          ))
        ) : displayProducts.length === 0 ? (
          <div className="shrink-0 flex items-center px-4">
            <p className="text-sm text-[#6B5B7B] font-cairo whitespace-nowrap">
              {t("dashboard.home.noProductsYet")}
            </p>
          </div>
        ) : (
          displayProducts.map((product) => {
            const isGenerating = generatingId === product.id
            return (
              <div
                key={product.id}
                className="shrink-0 w-40 rounded-xl border border-[#E4D8F0] bg-white shadow-sm p-3 flex flex-col gap-2 snap-start"
              >
                {product.imageUrl ? (
                  <div className="relative w-full h-16 rounded-lg overflow-hidden bg-[#F3EEFA]">
                    <Image
                      src={product.imageUrl}
                      alt={getDisplayName(product, locale)}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                ) : (
                  <div className="w-full h-16 rounded-lg bg-[#F3EEFA] flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-[#7C3AED]/40" aria-hidden="true" />
                  </div>
                )}

                <p className="text-sm font-semibold text-[#1E0A3C] font-cairo truncate">
                  {getDisplayName(product, locale)}
                </p>
                <p className="text-xs text-[#6B5B7B] font-mono">
                  {formatPrice(product.price, egpShort, locale)}
                </p>

                <button
                  disabled={isGenerating}
                  onClick={() => handleGenerateLink(product)}
                  aria-label={`${t("dashboard.home.createLinkForProduct")} — ${getDisplayName(product, locale)}`}
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-[#E4D8F0] px-2 min-h-[44px] text-xs font-semibold text-[#7C3AED] hover:bg-[#F3EEFA] transition-colors cursor-pointer disabled:opacity-50 font-cairo"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 motion-safe:animate-spin" />
                  ) : (
                    <Link2 className="h-3 w-3" aria-hidden="true" />
                  )}
                  {t("dashboard.home.createLinkForProduct")}
                </button>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
