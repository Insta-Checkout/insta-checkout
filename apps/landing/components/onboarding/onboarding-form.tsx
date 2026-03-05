"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "@/lib/locale-provider";
import { auth } from "@/lib/firebase";
import { StepIndicator } from "./step-indicator";
import { StepTwo } from "./step-two";
import { StepThree } from "./step-three";
import { ConfirmationScreen } from "./confirmation-screen";
import type { Step2Data } from "./types";

export function OnboardingForm() {
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState<Partial<Step2Data>>({});

  const handleBusinessInfo = useCallback((data: Step2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  }, []);

  const handleAuth = useCallback(
    async (firebaseUid: string, email: string): Promise<void> => {
      setIsSubmitting(true);

      const payload = {
        businessName: formData.businessName,
        category: categoryFromUrl || null,
        instapayNumber: formData.instapayNumber,
        maskedFullName: formData.maskedFullName,
        whatsappNumber: `20${formData.whatsappNumber?.replace(/^0/, "")}`,
        firebaseUid,
        email,
        socialLinks: {},
      };

      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/sellers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        let body: { error?: string; message?: string; details?: Array<{ field: string; message: string }> };
        try {
          body = text ? JSON.parse(text) : {};
        } catch {
          console.error("[POST /sellers] Invalid JSON response", res.status, text);
          toast.error(t("onboard.errors.serverError"));
          return;
        }

        if (res.status === 201) {
          const user = auth.currentUser;
          if (user) {
            try {
              const idToken = await user.getIdToken();
              await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
              });
            } catch (e) {
              console.warn("[Session] Failed to set cookie:", e);
            }
          }
          setIsComplete(true);
          return;
        }

        if (res.status === 409) {
          if (body.error === "DUPLICATE_EMAIL") {
            toast.error(t("onboard.errors.duplicateEmail"));
          } else {
            toast.error(t("onboard.errors.duplicateNumber"));
          }
          setCurrentStep(2);
          return;
        }

        if (res.status === 400 && body.details?.length) {
          const fieldStepMap: Record<string, number> = {
            businessName: 1,
            instapayNumber: 1,
            maskedFullName: 1,
            whatsappNumber: 1,
            email: 2,
            firebaseUid: 2,
          };
          const firstField = body.details[0]?.field;
          if (firstField && fieldStepMap[firstField]) {
            setCurrentStep(fieldStepMap[firstField]);
          }
          toast.error(body.details.map((d) => d.message).join("، "));
          return;
        }

        if (res.status === 500) {
          console.error("[POST /sellers] Server error", body);
          toast.error(t("onboard.errors.serverError"));
          return;
        }

        console.error("[POST /sellers] Unexpected response", res.status, body);
        toast.error(body?.message || t("onboard.errors.generic"));
      } catch (err) {
        console.error("[POST /sellers] Request failed", err);
        toast.error(
          err instanceof TypeError && err.message?.includes("fetch")
            ? t("onboard.errors.networkError")
            : t("onboard.errors.generic")
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, categoryFromUrl]
  );

  if (isComplete) {
    return (
      <ConfirmationScreen
        businessName={formData.businessName || ""}
        category={categoryFromUrl}
      />
    );
  }

  return (
    <div>
      <StepIndicator currentStep={currentStep} />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25 }}
          >
            <StepTwo
              defaultValues={formData}
              onNext={handleBusinessInfo}
            />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25 }}
          >
            <StepThree
              onBack={() => setCurrentStep(1)}
              onSubmit={handleAuth}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
