"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { step3Schema, type Step3Data } from "./types";

interface StepThreeProps {
  defaultValues: Partial<Step3Data>;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
}

export function StepThree({ defaultValues, onNext, onBack }: StepThreeProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      whatsappNumber: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">رقم واتساب *</Label>
        <div className="flex items-center gap-2" dir="ltr">
          <span className="flex h-12 items-center rounded-lg border-[1.5px] border-[#CBD5E1] bg-muted px-3 text-sm font-medium text-muted-foreground">
            +20
          </span>
          <Input
            id="whatsappNumber"
            placeholder="01XXXXXXXXX"
            className="h-12 flex-1 rounded-lg border-[1.5px] border-[#CBD5E1]"
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

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-bold text-foreground">بعد التسجيل:</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              هنبعتلك رسالة تحقق على واتساب. البوت بتاعنا هيبقى جاهز يساعدك
              تعمل لينكات دفع فورية.
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
