"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "@/lib/locale-provider"
import { confirmPayment } from "@/lib/api"
import { toast } from "sonner"
import Image from "next/image"
import { SellerHeader } from "./seller-header"
import { StepIndicator } from "./step-indicator"
import { StepOne } from "./step-one"
import { StepTwo } from "./step-two"
import { StepThree } from "./step-three"

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
}: CheckoutFlowProps) {
  const { t, locale } = useTranslations()
  const displayName = getProductDisplayName(productName, productNameAr, productNameEn, locale)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-md px-4 py-6">
        <SellerHeader
          businessName={sellerName}
          categoryTag={categoryTag}
          logoUrl={sellerLogo}
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

        {/* Footer */}
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
      </div>
    </div>
  )
}
