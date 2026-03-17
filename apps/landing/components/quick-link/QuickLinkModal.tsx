"use client"

import { useState } from "react"
import { Link2, Loader2, Copy, ChevronDown } from "lucide-react"
import { toast } from "sonner"

import { auth } from "@/lib/firebase"
import { fetchWithAuth, getBackendUrl } from "@/lib/api"
import { useTranslations } from "@/lib/locale-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

type Step = "form" | "success"

export function QuickLinkModal({ open, onOpenChange, onCreated }: Props): React.JSX.Element {
  const { t, locale } = useTranslations()
  const [step, setStep] = useState<Step>("form")
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [showMore, setShowMore] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState("")

  const egpShort = t("common.egpShort")

  const getToken = (): Promise<string | null> =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)

  const resetForm = (): void => {
    setStep("form")
    setTitle("")
    setPrice("")
    setDescription("")
    setShowMore(false)
    setGeneratedUrl("")
  }

  const handleClose = (isOpen: boolean): void => {
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim()) {
      toast.error(t("dashboard.quickLink.titleRequired"))
      return
    }
    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error(t("dashboard.quickLink.priceRequired"))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/quick-links`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            price: numPrice,
            description: description.trim() || undefined,
          }),
        },
        getToken
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || t("dashboard.quickLink.createFailed"))
        return
      }

      const data = await res.json()
      setGeneratedUrl(data.checkoutUrl)
      setStep("success")
      onCreated?.()
    } catch {
      toast.error(t("dashboard.quickLink.createFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(generatedUrl)
      toast.success(t("dashboard.links.copySuccess"))
    } catch {
      toast.success(t("dashboard.quickLink.linkReady"))
    }
  }

  const handleWhatsApp = (): void => {
    const text = locale === "ar"
      ? `لينك الدفع: ${title} — ${price} ج.م\n${generatedUrl}`
      : `Payment link: ${title} — ${price} EGP\n${generatedUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-cairo text-[#1E0A3C]">
                {t("dashboard.quickLink.title")}
              </DialogTitle>
              <p className="text-sm text-[#6B5B7B] font-cairo">
                {t("dashboard.quickLink.subtitle")}
              </p>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1E0A3C] font-cairo">
                  {t("dashboard.quickLink.titleLabel")}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("dashboard.quickLink.titlePlaceholder")}
                  className="w-full h-11 rounded-xl border border-[#E4D8F0] bg-white px-4 text-sm text-[#1E0A3C] placeholder:text-[#6B5B7B]/50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] font-cairo"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1E0A3C] font-cairo">
                  {t("dashboard.quickLink.priceLabel")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    min="1"
                    step="1"
                    className="w-full h-11 rounded-xl border border-[#E4D8F0] bg-white px-4 pe-14 text-sm text-[#1E0A3C] placeholder:text-[#6B5B7B]/50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] font-mono"
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-[#6B5B7B] font-cairo">
                    {egpShort}
                  </span>
                </div>
              </div>

              {/* More options toggle */}
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1.5 text-sm text-[#7C3AED] font-medium font-cairo cursor-pointer"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
                {t("dashboard.quickLink.moreOptions")}
              </button>

              {/* Optional description */}
              {showMore && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#1E0A3C] font-cairo">
                    {t("dashboard.quickLink.descriptionLabel")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("dashboard.quickLink.descriptionPlaceholder")}
                    rows={2}
                    className="w-full rounded-xl border border-[#E4D8F0] bg-white px-4 py-3 text-sm text-[#1E0A3C] placeholder:text-[#6B5B7B]/50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] font-cairo resize-none"
                  />
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !price}
                className="w-full gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                {t("dashboard.quickLink.create")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-cairo text-[#1E0A3C]">
                {t("dashboard.quickLink.linkReady")}
              </DialogTitle>
              <p className="text-sm text-[#6B5B7B] font-cairo">
                {t("dashboard.quickLink.linkReadySubtitle")}
              </p>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Generated URL */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedUrl}
                  readOnly
                  className="flex-1 h-11 rounded-xl border border-[#E4D8F0] bg-[#F3EEFA] px-4 text-sm text-[#1E0A3C] font-mono truncate"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="h-11 w-11 shrink-0 border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA] cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Share buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCopy}
                  className="flex-1 gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  {t("dashboard.quickLink.copyLink")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWhatsApp}
                  className="flex-1 gap-2 font-cairo bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20 cursor-pointer"
                >
                  {t("dashboard.quickLink.shareWhatsApp")}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
