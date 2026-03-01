"use client";

import { Button } from "@/components/ui/button";
import { type FullFormData, categoryOptions } from "./types";

interface StepFourProps {
  formData: FullFormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepFour({
  formData,
  onBack,
  onSubmit,
  isSubmitting,
}: StepFourProps) {
  const categoryLabel =
    categoryOptions.find((c) => c.value === formData.category)?.label ??
    formData.category;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground">ملخص البيانات</h3>

        <div className="space-y-3 text-sm">
          <SummaryRow label="اسم البيزنس" value={formData.businessName} />
          <SummaryRow label="التصنيف" value={categoryLabel} />
          {formData.instagramLink && (
            <SummaryRow label="إنستجرام" value={formData.instagramLink} dir="ltr" />
          )}
          {formData.facebookLink && (
            <SummaryRow label="فيسبوك" value={formData.facebookLink} dir="ltr" />
          )}
          <div className="border-t border-border" />
          <SummaryRow
            label="رقم InstaPay"
            value={formData.instapayNumber}
            mono
            dir="ltr"
          />
          <SummaryRow label="الاسم المقنّع" value={formData.maskedFullName} />
          <div className="border-t border-border" />
          <SummaryRow
            label="رقم واتساب"
            value={`+20${formData.whatsappNumber.replace(/^0/, "")}`}
            dir="ltr"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-xl text-base"
        >
          رجوع
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-hover"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              جاري التسجيل...
            </span>
          ) : (
            "سجّل دلوقتي"
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
  dir,
}: {
  label: string;
  value: string;
  mono?: boolean;
  dir?: string;
}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`font-medium text-foreground text-start ${mono ? "font-mono" : ""}`}
        dir={dir}
        style={mono ? { fontFamily: "var(--font-jetbrains), monospace" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
