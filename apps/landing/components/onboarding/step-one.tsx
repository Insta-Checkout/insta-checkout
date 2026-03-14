"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";
import { createStep1Schema, type Step1Data } from "./types";

interface StepOneProps {
  defaultValues: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
  onBack?: () => void;
}

export function StepOne({ defaultValues, onNext, onBack }: StepOneProps) {
  const { t } = useTranslations();
  const step1Schema = useMemo(() => createStep1Schema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      businessName: "",
      whatsappNumber: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Form fields — full width */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="businessName">{t("onboard.step1.businessName")}</Label>
            <Input
              id="businessName"
              placeholder={t("onboard.step1.placeholders.businessName")}
              className="h-12 rounded-lg border-[1.5px] border-input focus-visible:ring-2 focus-visible:ring-ring"
              aria-describedby={errors.businessName ? "businessName-error" : undefined}
              {...register("businessName")}
            />
            {errors.businessName && (
              <p id="businessName-error" className="text-sm text-destructive">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">{t("onboard.step1.whatsappNumber")}</Label>
            <div className="flex items-center gap-2" dir="ltr">
              <span className="flex h-12 items-center rounded-lg border-[1.5px] border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                +20
              </span>
              <Input
                id="whatsappNumber"
                placeholder="01XXXXXXXXX"
                className="h-12 flex-1 rounded-lg border-[1.5px] border-input focus-visible:ring-2 focus-visible:ring-ring"
                dir="ltr"
                aria-describedby={errors.whatsappNumber ? "whatsappNumber-error" : undefined}
                {...register("whatsappNumber")}
              />
            </div>
            {errors.whatsappNumber && (
              <p id="whatsappNumber-error" className="text-sm text-destructive">
                {errors.whatsappNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 flex-1 rounded-xl text-base gap-2 hover:bg-muted/80"
            >
              <ArrowLeftToLine className="h-4 w-4" />
              {t("onboard.step1.back")}
            </Button>
          )}
          <Button
            type="submit"
            className="h-12 flex-1 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20"
          >
            {t("onboard.step1.cta")}
          </Button>
        </div>
      </motion.div>
    </form>
  );
}
