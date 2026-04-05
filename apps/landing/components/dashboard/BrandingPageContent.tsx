"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from "@/lib/locale-provider"
import { fetchWithAuth, getBackendUrl } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import { Upload, Lock, RotateCcw, Store, Palette } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface BrandingState {
  logoUrl: string | null
  primaryColor: string | null
  coverPhotoUrl: string | null
  slogan: string | null
  sloganAr: string | null
  secondaryColor: string | null
  accentColor: string | null
  hidePoweredBy: boolean
}

const DEFAULT_BRANDING: BrandingState = {
  logoUrl: null,
  primaryColor: null,
  coverPhotoUrl: null,
  slogan: null,
  sloganAr: null,
  secondaryColor: null,
  accentColor: null,
  hidePoweredBy: false,
}

const getToken = (): Promise<string | null> =>
  auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)

function getContrastForeground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "#1E0A3C" : "#FFFFFF"
}

function ProBadge(): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full">
      <Lock className="w-3 h-3" aria-hidden="true" />
      Pro
    </span>
  )
}

export function BrandingPageContent(): React.JSX.Element {
  const { t, locale } = useTranslations()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState<"free" | "pro">("free")
  const [businessName, setBusinessName] = useState("")
  const [branding, setBranding] = useState<BrandingState>(DEFAULT_BRANDING)
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const isPro = plan === "pro"

  // Load seller data
  useEffect(() => {
    let cancelled = false
    const load = async (): Promise<void> => {
      try {
        const res = await fetchWithAuth(`${getBackendUrl()}/sellers/me`, {}, getToken)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setPlan(data.plan ?? "free")
        setBusinessName(data.businessName ?? "")
        if (data.branding) {
          setBranding({
            logoUrl: data.branding.logoUrl ?? null,
            primaryColor: data.branding.primaryColor ?? null,
            coverPhotoUrl: data.branding.coverPhotoUrl ?? null,
            slogan: data.branding.slogan ?? null,
            sloganAr: data.branding.sloganAr ?? null,
            secondaryColor: data.branding.secondaryColor ?? null,
            accentColor: data.branding.accentColor ?? null,
            hidePoweredBy: data.branding.hidePoweredBy ?? false,
          })
        }
      } catch {
        toast.error(t("branding.errors.loadFailed"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [t])

  const handleUpload = useCallback(async (file: File, type: "logo" | "cover"): Promise<void> => {
    const maxSize = type === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(t("branding.errors.fileTooLarge"))
      return
    }
    const allowed = ["image/png", "image/jpeg", "image/webp"]
    if (!allowed.includes(file.type)) {
      toast.error(t("branding.errors.invalidFileType"))
      return
    }

    setUploading(type)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/branding/upload`,
        { method: "POST", body: formData },
        getToken
      )
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.message ?? t("branding.errors.uploadFailed"))
        return
      }
      const { url } = await res.json()
      setBranding(prev => ({
        ...prev,
        [type === "logo" ? "logoUrl" : "coverPhotoUrl"]: url,
      }))
      toast.success(t("branding.uploadSuccess"))
    } catch {
      toast.error(t("branding.errors.uploadFailed"))
    } finally {
      setUploading(null)
    }
  }, [t])

  const handleSave = useCallback(async (): Promise<void> => {
    setSaving(true)
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branding }),
        },
        getToken
      )
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.message ?? t("branding.errors.saveFailed"))
        return
      }
      toast.success(t("branding.saveSuccess"))
    } catch {
      toast.error(t("branding.errors.saveFailed"))
    } finally {
      setSaving(false)
    }
  }, [branding, t])

  const handleReset = useCallback(async (): Promise<void> => {
    setSaving(true)
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branding: DEFAULT_BRANDING }),
        },
        getToken
      )
      if (!res.ok) {
        toast.error(t("branding.errors.saveFailed"))
        return
      }
      setBranding(DEFAULT_BRANDING)
      toast.success(t("branding.resetSuccess"))
    } catch {
      toast.error(t("branding.errors.saveFailed"))
    } finally {
      setSaving(false)
    }
  }, [t])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-[#E4D8F0] rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-[#E4D8F0] rounded-xl animate-pulse" />
          <div className="h-96 bg-[#E4D8F0] rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const primaryColor = branding.primaryColor || "#7C3AED"
  const slogan = locale === "ar"
    ? (branding.sloganAr || branding.slogan)
    : (branding.slogan || branding.sloganAr)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E0A3C] font-[family-name:var(--font-outfit)]">
            {t("branding.title")}
          </h1>
          <p className="text-sm text-[#6B5B7B] mt-1">{t("branding.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={saving}
            className="border-[#E4D8F0] text-[#6B5B7B] hover:bg-[#F3EEFA] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 ltr:mr-1.5 rtl:ml-1.5" aria-hidden="true" />
            {t("branding.resetDefault")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
          >
            {saving ? t("branding.saving") : t("branding.save")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Settings form */}
        <div className="space-y-4">
          {/* Logo upload */}
          <Card className="bg-white border-[#E4D8F0] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E0A3C]">
                {t("branding.logo.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file, "logo")
                }}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                onDrop={(e) => {
                  e.preventDefault(); e.stopPropagation()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleUpload(file, "logo")
                }}
                disabled={uploading === "logo"}
                className="w-full border-2 border-dashed border-[#E4D8F0] rounded-xl p-6 flex flex-col items-center gap-2 hover:border-[#7C3AED] hover:bg-[#F3EEFA]/50 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2"
              >
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-[#EDE9FE] rounded-2xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#7C3AED]" aria-hidden="true" />
                  </div>
                )}
                <span className="text-sm text-[#6B5B7B]">
                  {uploading === "logo" ? t("branding.uploading") : t("branding.logo.hint")}
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Cover photo upload (pro) */}
          <Card className="bg-white border-[#E4D8F0] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E0A3C] flex items-center gap-2">
                {t("branding.cover.title")}
                {!isPro && <ProBadge />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={!isPro}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file, "cover")
                }}
              />
              <button
                type="button"
                onClick={() => isPro && coverInputRef.current?.click()}
                onDragOver={(e) => { if (isPro) { e.preventDefault(); e.stopPropagation() } }}
                onDrop={(e) => {
                  if (!isPro) return
                  e.preventDefault(); e.stopPropagation()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleUpload(file, "cover")
                }}
                disabled={!isPro || uploading === "cover"}
                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 ${
                  isPro
                    ? "border-[#E4D8F0] hover:border-[#7C3AED] hover:bg-[#F3EEFA]/50 cursor-pointer"
                    : "border-[#E4D8F0]/50 opacity-60 cursor-not-allowed"
                }`}
              >
                {branding.coverPhotoUrl ? (
                  <img src={branding.coverPhotoUrl} alt="" className="w-full h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-[#EDE9FE] rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#7C3AED]" aria-hidden="true" />
                  </div>
                )}
                <span className="text-sm text-[#6B5B7B]">
                  {!isPro ? t("branding.proRequired") : uploading === "cover" ? t("branding.uploading") : t("branding.cover.hint")}
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="bg-white border-[#E4D8F0] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E0A3C]">
                {t("branding.colors.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary color (free) */}
              <div className="space-y-1.5">
                <Label htmlFor="primaryColor" className="text-sm text-[#1E0A3C]">
                  {t("branding.colors.primary")}
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={branding.primaryColor || "#7C3AED"}
                    onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-[#E4D8F0] cursor-pointer"
                  />
                  <Input
                    value={branding.primaryColor || ""}
                    onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value || null }))}
                    placeholder="#7C3AED"
                    className="flex-1 border-[#E4D8F0] text-sm"
                  />
                </div>
              </div>

              {/* Secondary color (pro) */}
              <div className="space-y-1.5">
                <Label htmlFor="secondaryColor" className="text-sm text-[#1E0A3C] flex items-center gap-2">
                  {t("branding.colors.secondary")}
                  {!isPro && <ProBadge />}
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={branding.secondaryColor || "#F3EEFA"}
                    onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    disabled={!isPro}
                    className={`w-10 h-10 rounded-lg border border-[#E4D8F0] ${isPro ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
                  />
                  <Input
                    value={branding.secondaryColor || ""}
                    onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value || null }))}
                    placeholder="#F3EEFA"
                    disabled={!isPro}
                    className="flex-1 border-[#E4D8F0] text-sm"
                  />
                </div>
              </div>

              {/* Accent color (pro) */}
              <div className="space-y-1.5">
                <Label htmlFor="accentColor" className="text-sm text-[#1E0A3C] flex items-center gap-2">
                  {t("branding.colors.accent")}
                  {!isPro && <ProBadge />}
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={branding.accentColor || "#F3EEFA"}
                    onChange={(e) => setBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                    disabled={!isPro}
                    className={`w-10 h-10 rounded-lg border border-[#E4D8F0] ${isPro ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
                  />
                  <Input
                    value={branding.accentColor || ""}
                    onChange={(e) => setBranding(prev => ({ ...prev, accentColor: e.target.value || null }))}
                    placeholder="#F3EEFA"
                    disabled={!isPro}
                    className="flex-1 border-[#E4D8F0] text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slogan + settings */}
          <Card className="bg-white border-[#E4D8F0] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E0A3C]">
                {t("branding.extra.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="slogan" className="text-sm text-[#1E0A3C] flex items-center gap-2">
                  {t("branding.extra.slogan")}
                  {!isPro && <ProBadge />}
                </Label>
                <Input
                  id="slogan"
                  value={branding.slogan || ""}
                  onChange={(e) => setBranding(prev => ({ ...prev, slogan: e.target.value || null }))}
                  placeholder={t("branding.extra.sloganPlaceholder")}
                  maxLength={80}
                  disabled={!isPro}
                  className="border-[#E4D8F0] text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sloganAr" className="text-sm text-[#1E0A3C] flex items-center gap-2">
                  {t("branding.extra.sloganAr")}
                  {!isPro && <ProBadge />}
                </Label>
                <Input
                  id="sloganAr"
                  value={branding.sloganAr || ""}
                  onChange={(e) => setBranding(prev => ({ ...prev, sloganAr: e.target.value || null }))}
                  placeholder={t("branding.extra.sloganArPlaceholder")}
                  maxLength={80}
                  disabled={!isPro}
                  dir="rtl"
                  className="border-[#E4D8F0] text-sm font-[family-name:var(--font-cairo)]"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="hidePoweredBy" className="text-sm text-[#1E0A3C]">
                    {t("branding.extra.hidePoweredBy")}
                  </Label>
                  {!isPro && <ProBadge />}
                </div>
                <Switch
                  id="hidePoweredBy"
                  checked={branding.hidePoweredBy}
                  onCheckedChange={(checked) => setBranding(prev => ({ ...prev, hidePoweredBy: checked }))}
                  disabled={!isPro}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Live preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="bg-white border-[#E4D8F0] shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E0A3C] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
                {t("branding.preview.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className="bg-[#FAFAFA] px-4 py-6 min-h-[480px]"
                style={{
                  "--primary": primaryColor,
                  "--primary-foreground": getContrastForeground(primaryColor),
                } as React.CSSProperties}
              >
                <div className="mx-auto max-w-xs">
                  {/* Cover photo preview */}
                  {branding.coverPhotoUrl && (
                    <div className="w-full h-24 -mx-0 overflow-hidden rounded-t-xl relative mb-0">
                      <img src={branding.coverPhotoUrl} alt="" className="w-full h-full object-cover object-center" />
                    </div>
                  )}

                  {/* Header preview */}
                  <div className={`flex flex-col items-center gap-2 pb-4 border-b border-[#E4D8F0] ${branding.coverPhotoUrl ? "-mt-6 relative z-10" : ""}`}>
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl ${branding.coverPhotoUrl ? "ring-3 ring-white bg-white" : ""}`}
                      style={{ backgroundColor: branding.coverPhotoUrl ? undefined : `${primaryColor}15` }}
                    >
                      {branding.logoUrl ? (
                        <img src={branding.logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <Store className="w-5 h-5" style={{ color: primaryColor }} />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#1E0A3C] text-center">{businessName || t("branding.preview.storeFallback")}</h3>
                    {slogan && (
                      <p className="text-xs text-[#6B5B7B] text-center">{slogan}</p>
                    )}
                  </div>

                  {/* Step indicator preview */}
                  <div className="flex items-center justify-center gap-2 py-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: primaryColor }}>1</div>
                    <div className="w-8 h-0.5 bg-[#E4D8F0]" />
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[#6B5B7B] bg-[#E4D8F0]">2</div>
                    <div className="w-8 h-0.5 bg-[#E4D8F0]" />
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[#6B5B7B] bg-[#E4D8F0]">3</div>
                  </div>

                  {/* Sample product card */}
                  <div className="bg-white rounded-xl border border-[#E4D8F0] p-3 flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-[#1E0A3C]">{t("branding.preview.sampleProduct")}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      250 EGP
                    </span>
                  </div>

                  {/* CTA button preview */}
                  <button
                    type="button"
                    className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-default"
                    style={{
                      backgroundColor: primaryColor,
                      color: getContrastForeground(primaryColor),
                    }}
                  >
                    {t("branding.preview.ctaButton")}
                  </button>

                  {/* Footer preview */}
                  {!branding.hidePoweredBy && (
                    <p className="text-center text-[10px] text-[#6B5B7B] mt-4">
                      Powered by Instacheckouteg.com
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
