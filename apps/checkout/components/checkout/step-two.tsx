"use client"

import { useState, useRef, type ChangeEvent, type FormEvent } from "react"
import { Upload, ImageIcon, X, Phone, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StepTwoProps {
  onSubmit: (phoneNumber: string, screenshot: File) => void
  isSubmitting: boolean
}

export function StepTwo({ onSubmit, isSubmitting }: StepTwoProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
      setPhoneError("رقم الهاتف مطلوب")
      return false
    }
    if (digits.length !== 11) {
      setPhoneError("يجب أن يكون رقم الهاتف 11 رقم")
      return false
    }
    if (!digits.startsWith("01")) {
      setPhoneError("يجب أن يبدأ رقم الهاتف بـ 01")
      return false
    }
    return true
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
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
    if (!validatePhone() || !screenshot) return
    onSubmit(phoneNumber.replace(/\D/g, ""), screenshot)
  }

  const isFormValid = phoneNumber.replace(/\D/g, "").length === 11 && screenshot !== null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Phone Number Field */}
      <Card>
        <CardContent className="py-5">
          <div className="flex flex-col gap-3">
            <label htmlFor="phone" className="text-sm font-bold text-foreground flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              رقم الهاتف المستخدم في التحويل
              <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              حتى يتمكن البائع من مطابقة إشعار انستاباي الخاص به
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
              لقطة شاشة التحويل
              <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              ارفع لقطة شاشة لتأكيد تحويل انستاباي
            </p>

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={previewUrl}
                  alt="معاينة لقطة الشاشة"
                  className="w-full max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="absolute top-2 left-2 size-8 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground transition-colors"
                  aria-label="إزالة لقطة الشاشة"
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
                  <span className="text-sm font-medium text-foreground">اضغط لرفع لقطة الشاشة</span>
                  <span className="text-xs text-muted-foreground">JPEG أو PNG</span>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="رفع لقطة شاشة التحويل"
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
              جاري الإرسال...
            </span>
          ) : (
            "تأكيد التحويل"
          )}
        </Button>
        {!isFormValid && !isSubmitting && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            أكمل جميع الحقول المطلوبة للمتابعة
          </p>
        )}
      </div>
    </form>
  )
}
