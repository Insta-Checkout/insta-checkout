"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-provider";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { get } = useTranslations()
  const steps = (get("onboard.steps") ?? ["Your info", "Create account"]) as string[]
  return (
    <div className="flex items-center justify-center gap-0 w-full mb-8">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{ scale: isActive ? 1.05 : 1 }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300",
                  isCompleted && "bg-success text-white",
                  isActive && "bg-primary text-primary-foreground shadow-md shadow-primary/20",
                  !isCompleted && !isActive && "border-2 border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                ) : (
                  <span className={isActive ? "text-primary-foreground" : isCompleted ? "text-white" : "text-muted-foreground"}>
                    {stepNum}
                  </span>
                )}
              </motion.div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap transition-colors",
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
                  "h-0.5 w-6 sm:w-10 mx-0.5 mt-[-20px] rounded-full transition-colors duration-300",
                  currentStep > stepNum + 1
                    ? "bg-success"
                    : currentStep > stepNum
                      ? "bg-primary/60"
                      : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
