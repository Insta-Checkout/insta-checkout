"use client"

import { useTranslations } from "@/lib/locale-provider"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { get } = useTranslations()
  const stepLabels = (get("checkout.steps") ?? ["Order details", "Confirm payment", "Complete"]) as string[]

  return (
    <div className="py-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      {/* Circles + connector lines row */}
      <div className="flex items-center px-4 mb-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isComplete = step < currentStep
          const isActive = step === currentStep

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div
                className={`flex items-center justify-center size-8 rounded-full text-sm font-bold shrink-0 transition-all ${
                  isComplete
                    ? "bg-[#7C3AED] text-white"
                    : isActive
                      ? "bg-[#7C3AED] text-white ring-4 ring-[#7C3AED]/20"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {/* Connector line */}
              {i < totalSteps - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 rounded-full ${
                    isComplete ? "bg-[#7C3AED]" : "bg-border"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      {/* Labels row */}
      <div className="flex">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isComplete = step < currentStep
          const isActive = step === currentStep
          return (
            <div key={step} className="flex-1 text-center">
              <span
                className={`text-xs font-medium ${
                  isActive || isComplete ? "text-[#7C3AED]" : "text-muted-foreground"
                }`}
              >
                {stepLabels[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
