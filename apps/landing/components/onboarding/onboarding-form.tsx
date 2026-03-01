"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { StepIndicator } from "./step-indicator";
import { StepOne } from "./step-one";
import { StepTwo } from "./step-two";
import { StepThree } from "./step-three";
import { StepFour } from "./step-four";
import { ConfirmationScreen } from "./confirmation-screen";
import type { FullFormData, Step1Data, Step2Data, Step3Data } from "./types";

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState<Partial<FullFormData>>({});

  const handleStep1 = useCallback((data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  }, []);

  const handleStep2 = useCallback((data: Step2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  }, []);

  const handleStep3 = useCallback((data: Step3Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    const payload = {
      businessName: formData.businessName,
      category: formData.category,
      instapayNumber: formData.instapayNumber,
      maskedFullName: formData.maskedFullName,
      whatsappNumber: `20${formData.whatsappNumber?.replace(/^0/, "")}`,
      socialLinks: {
        instagram: formData.instagramLink || "",
        facebook: formData.facebookLink || "",
      },
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/sellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (res.status === 201) {
        setIsComplete(true);
        return;
      }

      if (res.status === 409) {
        toast.error("الرقم ده مسجل قبل كده. جرّب رقم تاني أو تواصل معانا.");
        setCurrentStep(3);
        return;
      }

      if (res.status === 400 && body.details) {
        const fieldStepMap: Record<string, number> = {
          businessName: 1,
          category: 1,
          instapayNumber: 2,
          maskedFullName: 2,
          whatsappNumber: 3,
        };
        const firstField = body.details[0]?.field;
        if (firstField && fieldStepMap[firstField]) {
          setCurrentStep(fieldStepMap[firstField]);
        }
        toast.error(body.details.map((d: { message: string }) => d.message).join("، "));
        return;
      }

      toast.error("حصل مشكلة. جرّب تاني.");
    } catch {
      toast.error("حصل مشكلة. جرّب تاني.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  if (isComplete) {
    return <ConfirmationScreen businessName={formData.businessName || ""} />;
  }

  return (
    <div>
      <StepIndicator currentStep={currentStep} />

      <div className="transition-opacity duration-200">
        {currentStep === 1 && (
          <StepOne defaultValues={formData} onNext={handleStep1} />
        )}
        {currentStep === 2 && (
          <StepTwo
            defaultValues={formData}
            onNext={handleStep2}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <StepThree
            defaultValues={formData}
            onNext={handleStep3}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <StepFour
            formData={formData as FullFormData}
            onBack={() => setCurrentStep(3)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
