"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "@/lib/locale-provider"
import { SellerHeader } from "./seller-header"
import { LanguageSwitcher } from "../language-switcher"
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
  instaPayAccount: string
  maskedName: string
  whatsappLink?: string
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
  instaPayAccount,
  maskedName,
  whatsappLink,
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
    async (phoneNumber: string, _screenshot: File) => {
      setIsSubmitting(true)

      // Simulate API call — in production this would POST to your backend
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitting(false)
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [displayName, price, sellerName]
  )

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <SellerHeader
          businessName={sellerName}
          categoryTag={categoryTag}
          logoUrl={sellerLogo}
        />

        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <main className="mt-2">
          {currentStep === 1 && (
            <StepOne
              productName={displayName}
              productImage={productImage}
              price={price}
              instaPayAccount={instaPayAccount}
              maskedName={maskedName}
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
        <footer className="mt-10 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t("checkout.footer")}
          </p>
        </footer>
      </div>
    </div>
  )
}
