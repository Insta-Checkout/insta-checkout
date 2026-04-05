"use client"

import { Fragment } from "react"
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
      <div className="flex items-start px-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isComplete = step < currentStep
          const isActive = step === currentStep

          return (
            <Fragment key={step}>
              {/* Step column: circle + label stacked */}
              <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
                {/* Circle */}
                <div
                  className={`flex items-center justify-center size-8 rounded-full text-sm font-bold shrink-0 transition-all ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-primary/10 text-primary/40"
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
                {/* Label */}
                <span
                  className={`text-xs font-medium mt-1.5 text-center whitespace-nowrap ${
                    isActive || isComplete ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {stepLabels[i]}
                </span>
              </div>
              {/* Connector line between steps */}
              {i < totalSteps - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mt-4 rounded-full ${
                    isComplete ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
