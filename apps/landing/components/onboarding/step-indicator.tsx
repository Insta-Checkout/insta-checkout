"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  "معلومات البيزنس",
  "تفاصيل InstaPay",
  "رقم واتساب",
  "تأكيد",
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full mb-8">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  isCompleted && "bg-success text-white",
                  isActive && "bg-primary text-white",
                  !isCompleted &&
                    !isActive &&
                    "border-2 border-[#CBD5E1] text-[#CBD5E1]"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  isActive
                    ? "text-primary"
                    : isCompleted
                      ? "text-success"
                      : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-12 mx-1 mt-[-18px]",
                  currentStep > stepNum + 1
                    ? "bg-success"
                    : currentStep > stepNum
                      ? "bg-primary"
                      : "bg-[#CBD5E1]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
