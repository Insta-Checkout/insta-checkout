"use client"

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "@/lib/locale-provider"
import { confirmPayment } from "@/lib/api"
import { toast } from "sonner"
import Image from "next/image"
import { SellerHeader } from "./seller-header"
import { StepIndicator } from "./step-indicator"
import { StepOne } from "./step-one"
import { StepTwo } from "./step-two"
import { StepThree } from "./step-three"

interface SellerBranding {
  logoUrl?: string | null
  primaryColor?: string | null
  coverPhotoUrl?: string | null
  slogan?: string | null
  sloganAr?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
  hidePoweredBy?: boolean
}

interface CheckoutFlowProps {
  sellerName: string
  sellerLogo?: string
  categoryTag?: string
  productName: string
  productNameAr?: string | null
  productNameEn?: string | null
  productImage?: string
  price: string
  instapayLink: string | null
  whatsappLink?: string
  paymentLinkId?: string
  token?: string
  sellerPlan?: string
  sellerBranding?: SellerBranding
}

/** Returns white or dark foreground for WCAG AA 4.5:1 contrast. */
function getContrastForeground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "#1E0A3C" : "#FFFFFF"
}

function getProductDisplayName(
  productName: string,
  productNameAr?: string | null,
  productNameEn?: string | null,
  locale: string = "ar"
): string {
  if (locale === "ar") return productNameAr || productName
  return productNameEn || productName
}

export function CheckoutFlow({
  sellerName,
  sellerLogo,
  categoryTag,
  productName,
  productNameAr,
  productNameEn,
  productImage,
  price,
  instapayLink,
  whatsappLink,
  token,
  sellerPlan = "free",
  sellerBranding,
}: CheckoutFlowProps) {
  const { t, locale } = useTranslations()
  const displayName = getProductDisplayName(productName, productNameAr, productNameEn, locale)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const brandingStyles = useMemo(() => {
    if (!sellerBranding) return undefined
    const vars: Record<string, string> = {}
    if (sellerBranding.primaryColor) {
      vars["--primary"] = sellerBranding.primaryColor
      vars["--primary-foreground"] = getContrastForeground(sellerBranding.primaryColor)
      vars["--ring"] = sellerBranding.primaryColor
    }
    if (sellerBranding.secondaryColor) {
      vars["--secondary"] = sellerBranding.secondaryColor
    }
    if (sellerBranding.accentColor) {
      vars["--accent"] = sellerBranding.accentColor
    }
    return Object.keys(vars).length > 0 ? vars : undefined
  }, [sellerBranding])

  const showFooter = !(sellerPlan === "pro" && sellerBranding?.hidePoweredBy)
  const slogan = locale === "ar"
    ? (sellerBranding?.sloganAr || sellerBranding?.slogan)
    : (sellerBranding?.slogan || sellerBranding?.sloganAr)

  const handleProceedToStep2 = useCallback(() => {
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleSubmitPayment = useCallback(
    async (phoneNumber: string, fullName: string, screenshot: File) => {
      if (!token) {
        toast.error(t("checkout.errors.notFound"))
        return
      }
      setIsSubmitting(true)

      try {
        const egyptianPhone = phoneNumber.startsWith("01")
          ? `20${phoneNumber.slice(1)}`
          : phoneNumber.startsWith("20")
            ? phoneNumber
            : `20${phoneNumber}`

        const res = await confirmPayment(token, {
          buyerPhone: egyptianPhone,
          buyerName: fullName,
          screenshot,
        })

        if (res.error) {
          const errorKey = res.error === "NETWORK_ERROR"
            ? "checkout.errors.networkError"
            : "checkout.errors.unknown"
          toast.error(t(errorKey))
          return
        }

        setCurrentStep(3)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } catch {
        toast.error(t("checkout.errors.notFound"))
      } finally {
        setIsSubmitting(false)
      }
    },
    [token, t]
  )

  return (
    <div
      className="min-h-dvh bg-background"
      style={brandingStyles as React.CSSProperties | undefined}
    >
      <div className="mx-auto max-w-md px-4 py-6">
        <SellerHeader
          businessName={sellerName}
          categoryTag={categoryTag}
          logoUrl={sellerLogo}
          coverPhotoUrl={sellerBranding?.coverPhotoUrl ?? undefined}
          slogan={slogan ?? undefined}
        />

        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <main className="mt-2">
          {currentStep === 1 && (
            <StepOne
              sellerName={sellerName}
              productName={displayName}
              productImage={productImage}
              price={price}
              instapayLink={instapayLink}
              onProceed={handleProceedToStep2}
            />
          )}

          {currentStep === 2 && (
            <StepTwo
              onSubmit={handleSubmitPayment}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 3 && (
            <StepThree
              productName={displayName}
              price={price}
              sellerName={sellerName}
              whatsappLink={whatsappLink}
            />
          )}
        </main>

        {/* Footer — hidden for pro sellers with hidePoweredBy */}
        {showFooter && (
          <footer className="mt-10 pb-4 flex justify-center">
            <a
              href="https://instacheckouteg.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground/60 transition-colors"
            >
              <Image
                src="/icon-32x32.png"
                alt="Insta Checkout"
                width={14}
                height={14}
                className="rounded-sm"
              />
              {t("checkout.footer")}
            </a>
          </footer>
        )}
      </div>
    </div>
  )
}
