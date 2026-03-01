"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { step2Schema, type Step2Data } from "./types";

interface StepTwoProps {
  defaultValues: Partial<Step2Data>;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

export function StepTwo({ defaultValues, onNext, onBack }: StepTwoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      instapayNumber: "",
      maskedFullName: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="instapayNumber">رقم حساب InstaPay *</Label>
        <Input
          id="instapayNumber"
          placeholder="الرقم اللي العميل هيحوّل عليه"
          className="h-12 rounded-lg border-[1.5px] border-[#CBD5E1] font-mono text-lg"
          dir="ltr"
          style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          aria-describedby={errors.instapayNumber ? "instapayNumber-error" : undefined}
          {...register("instapayNumber")}
        />
        {errors.instapayNumber && (
          <p id="instapayNumber-error" className="text-sm text-destructive">
            {errors.instapayNumber.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maskedFullName">الاسم المقنّع *</Label>
        <Input
          id="maskedFullName"
          placeholder='مثلاً: أ*** م*** أ** م***'
          className="h-12 rounded-lg border-[1.5px] border-[#CBD5E1]"
          aria-describedby={errors.maskedFullName ? "maskedFullName-error" : undefined}
          {...register("maskedFullName")}
        />
        {errors.maskedFullName && (
          <p id="maskedFullName-error" className="text-sm text-destructive">
            {errors.maskedFullName.message}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-success/30 bg-success/5 p-4">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-bold text-foreground">ليه بنطلب الاسم المقنّع؟</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              لما العميل يحوّل على InstaPay، التطبيق بيظهرله اسم المستلم بشكل
              مقنّع قبل ما يأكد. إحنا بنعرض نفس الاسم ده في صفحة الدفع عشان
              العميل يتأكد إنه بيحوّل للشخص الصح.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-12 flex-1 rounded-xl text-base"
        >
          رجوع
        </Button>
        <Button
          type="submit"
          className="h-12 flex-1 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-hover"
        >
          التالي
        </Button>
      </div>
    </form>
  );
}
