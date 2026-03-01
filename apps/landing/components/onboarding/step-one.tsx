"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { step1Schema, type Step1Data, categoryOptions } from "./types";

interface StepOneProps {
  defaultValues: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
}

export function StepOne({ defaultValues, onNext }: StepOneProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      businessName: "",
      category: undefined,
      instagramLink: "",
      facebookLink: "",
      ...defaultValues,
    },
  });

  const category = watch("category");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="businessName">اسم البيزنس *</Label>
        <Input
          id="businessName"
          placeholder='مثلاً: Sweet Bites'
          className="h-12 rounded-lg border-[1.5px] border-[#CBD5E1]"
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
        <Label htmlFor="category">التصنيف *</Label>
        <Select
          value={category}
          onValueChange={(val) =>
            setValue("category", val as Step1Data["category"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger
            id="category"
            className="h-12 w-full rounded-lg border-[1.5px] border-[#CBD5E1]"
            aria-describedby={errors.category ? "category-error" : undefined}
          >
            <SelectValue placeholder="اختار تصنيف البيزنس" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p id="category-error" className="text-sm text-destructive">
            {errors.category.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagramLink">لينك إنستجرام</Label>
        <Input
          id="instagramLink"
          placeholder="instagram.com/yourbusiness"
          className="h-12 rounded-lg border-[1.5px] border-[#CBD5E1]"
          dir="ltr"
          {...register("instagramLink")}
        />
        <p className="text-xs text-muted-foreground">
          اختياري — بيظهر في صفحة الدفع
        </p>
        {errors.instagramLink && (
          <p className="text-sm text-destructive">
            {errors.instagramLink.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="facebookLink">لينك فيسبوك</Label>
        <Input
          id="facebookLink"
          placeholder="facebook.com/yourbusiness"
          className="h-12 rounded-lg border-[1.5px] border-[#CBD5E1]"
          dir="ltr"
          {...register("facebookLink")}
        />
        <p className="text-xs text-muted-foreground">
          اختياري — بيظهر في صفحة الدفع
        </p>
        {errors.facebookLink && (
          <p className="text-sm text-destructive">
            {errors.facebookLink.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-hover"
      >
        التالي
      </Button>
    </form>
  );
}
