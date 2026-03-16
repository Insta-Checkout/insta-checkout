"use client"

import { useState, useRef, type ChangeEvent, type FormEvent } from "react"
import { Upload, ImageIcon, X, Phone, Loader2, User } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StepTwoProps {
  onSubmit: (phoneNumber: string, fullName: string, screenshot: File) => void
  isSubmitting: boolean
}

export function StepTwo({ onSubmit, isSubmitting }: StepTwoProps) {
  const { t } = useTranslations()
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [nameError, setNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`
  }

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    if (raw.length <= 11) {
      setPhoneNumber(formatPhoneNumber(raw))
      if (phoneError) setPhoneError("")
    }
  }

  const validatePhone = () => {
    const digits = phoneNumber.replace(/\D/g, "")
    if (digits.length === 0) {
      setPhoneError(t("checkout.step2.phoneRequired"))
      return false
    }
    if (digits.length !== 11) {
      setPhoneError(t("checkout.step2.phoneLength"))
      return false
    }
    if (!digits.startsWith("01")) {
      setPhoneError(t("checkout.step2.phonePrefix"))
      return false
    }
    return true
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("checkout.step2.fileTooLarge"))
        return
      }
      setScreenshot(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeScreenshot = () => {
    setScreenshot(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || fullName.trim().length < 2) {
      setNameError(t("checkout.step2.fullNameRequired"))
      return
    }
    if (!validatePhone() || !screenshot) return
    onSubmit(phoneNumber.replace(/\D/g, ""), fullName.trim(), screenshot)
  }

  const isFormValid = fullName.trim().length >= 2 && phoneNumber.replace(/\D/g, "").length === 11 && screenshot !== null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Full Name Field */}
      <Card>
        <CardContent className="py-5">
          <div className="flex flex-col gap-3">
            <label htmlFor="fullName" className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="size-4 text-primary" />
              {t("checkout.step2.fullName")}
              <span className="text-destructive">*</span>
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (nameError) setNameError("")
              }}
              placeholder={t("checkout.step2.fullNamePlaceholder")}
              required
              className={`h-12 text-sm ${
                nameError ? "border-destructive ring-destructive/20" : ""
              }`}
              aria-describedby={nameError ? "name-error" : undefined}
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p id="name-error" className="text-xs text-destructive font-medium">
                {nameError}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Field */}
      <Card>
        <CardContent className="py-5">
          <div className="flex flex-col gap-3">
            <label htmlFor="phone" className="text-sm font-bold text-foreground flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              {t("checkout.step2.phoneLabel")}
              <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              {t("checkout.step2.phoneHint")}
            </p>
            <div className="relative" dir="ltr">
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="01X XXXX XXXX"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`h-12 text-lg font-mono text-left pr-4 pl-4 ${
                  phoneError ? "border-destructive ring-destructive/20" : ""
                }`}
                aria-describedby={phoneError ? "phone-error" : undefined}
                aria-invalid={!!phoneError}
              />
            </div>
            {phoneError && (
              <p id="phone-error" className="text-xs text-destructive font-medium" dir="rtl">
                {phoneError}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Screenshot Upload Field */}
      <Card>
        <CardContent className="py-5">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              {t("checkout.step2.screenshotLabel")}
              <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              {t("checkout.step2.screenshotHint")}
            </p>

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={previewUrl}
                  alt={t("checkout.step2.screenshotPreview")}
                  className="w-full max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="absolute top-2 start-2 size-11 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground transition-colors"
                  aria-label={t("checkout.step2.removeScreenshot")}
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 py-10 px-4 hover:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                  <Upload className="size-6" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-foreground">{t("checkout.step2.uploadPrompt")}</span>
                  <span className="text-xs text-muted-foreground">{t("checkout.step2.uploadFormat")}</span>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="sr-only"
              onChange={handleFileChange}
              aria-label={t("checkout.step2.screenshotLabel")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit CTA */}
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm pt-3 pb-6 -mx-1 px-1">
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full h-14 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none"
        >
            {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              {t("checkout.step2.submitting")}
            </span>
          ) : (
            t("checkout.step2.submit")
          )}
        </Button>
        {!isFormValid && !isSubmitting && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t("checkout.step2.completeFields")}
          </p>
        )}
      </div>
    </form>
  )
}
