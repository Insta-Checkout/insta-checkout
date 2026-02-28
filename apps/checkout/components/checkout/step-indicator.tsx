"use client"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

const stepLabels = [
  "تفاصيل الطلب",
  "تأكيد الدفع",
  "اكتمل",
]

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 py-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isComplete = step < currentStep

        return (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`flex items-center justify-center size-8 rounded-full text-sm font-bold transition-all ${
                  isComplete
                    ? "bg-[#10B981] text-card"
                    : isActive
                    ? "bg-[#0D9488] text-card ring-4 ring-[#0D9488]/20"
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
              <span
                className={`text-xs font-medium ${
                  isActive || isComplete ? "text-[#0D9488]" : "text-muted-foreground"
                }`}
              >
                {stepLabels[i]}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full -mt-5 ${
                  isComplete ? "bg-[#10B981]" : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
