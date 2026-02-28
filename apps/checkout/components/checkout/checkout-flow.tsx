"use client"

import { useState, useCallback } from "react"
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
  productImage?: string
  price: string
  instaPayAccount: string
  maskedName: string
  whatsappLink?: string
}

export function CheckoutFlow({
  sellerName,
  sellerLogo,
  categoryTag,
  productName,
  productImage,
  price,
  instaPayAccount,
  maskedName,
  whatsappLink,
}: CheckoutFlowProps) {
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
    [productName, price, sellerName]
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
              productName={productName}
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
              productName={productName}
              price={price}
              sellerName={sellerName}
              whatsappLink={whatsappLink}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-10 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            مدعوم بواسطة دفع آمن عبر انستاباي
          </p>
        </footer>
      </div>
    </div>
  )
}
