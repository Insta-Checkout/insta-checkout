"use client";

import { Cake, Shirt, Smartphone, Scissors, Package, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-provider";

const ICON_MAP = {
  Cake,
  Shirt,
  Smartphone,
  Scissors,
  Package,
} as const;

const BUSINESS_TYPE_ICON: Record<string, keyof typeof ICON_MAP> = {
  "Food & Desserts": "Cake",
  Clothing: "Shirt",
  Electronics: "Smartphone",
  Services: "Scissors",
  Other: "Package",
};

type BusinessTypeValue = "Food & Desserts" | "Clothing" | "Electronics" | "Services" | "Other";

interface CheckoutPreviewProps {
  businessName: string;
  productName: string;
  price: number;
  businessType?: BusinessTypeValue;
  categoryTag?: string;
  inPhoneFrame?: boolean;
  disabled?: boolean;
  size?: "full" | "thumbnail";
  className?: string;
}

export function CheckoutPreview({
  businessName,
  productName,
  price,
  businessType = "Food & Desserts",
  categoryTag,
  inPhoneFrame = true,
  disabled = true,
  size = "full",
  className,
}: CheckoutPreviewProps) {
  const { t } = useTranslations()
  const iconName = BUSINESS_TYPE_ICON[businessType] ?? "Cake";
  const IconComponent = ICON_MAP[iconName] ?? Cake;

  // Match Checkout app layout: SellerHeader first, then Order Card, Payment Instructions, InstaPay, Verification, CTA
  const content = (
    <div className="flex flex-col gap-5 p-4 text-sm pb-6">
      {/* SellerHeader — matches checkout app, at top */}
      <header className="flex flex-col items-center gap-3 pb-4 border-b border-border">
        <div className="flex items-center justify-center size-12 rounded-2xl bg-primary/10 text-primary">
          <IconComponent className="size-6" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <h1 className="text-base font-bold text-foreground text-balance text-center">
            {businessName}
          </h1>
          {categoryTag && (
            <span className="text-xs text-muted-foreground">{categoryTag}</span>
          )}
        </div>
      </header>

      {/* Order Details Card — matches checkout step-one */}
      <Card className="overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-bold text-foreground text-base leading-tight">{productName}</h3>
            <p className="text-xs text-muted-foreground">{t("checkout.step1.paymentRequest")}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0D9488]/10 text-[#0D9488] px-3 py-2 rounded-xl">
            <span className="text-xl font-bold">{price}</span>
            <span className="text-xs font-semibold">{t("common.egpShort")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions — matches checkout */}
      <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="bg-accent px-4 py-2.5 border-b border-border">
          <p className="text-xs font-bold text-accent-foreground flex items-center gap-2">
            <Smartphone className="size-3.5" />
            {t("checkout.step1.paymentMethod")}
          </p>
        </div>
        <CardContent className="py-3">
          <ol className="flex flex-col gap-2 text-xs text-foreground">
            <li className="flex items-start gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488] text-[10px] font-bold shrink-0">1</span>
              <span>{t("checkout.step1.instructions.0")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488] text-[10px] font-bold shrink-0">2</span>
              <span>{t("checkout.step1.instructions.1")}</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Open InstaPay button — matches checkout */}
      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <CardContent className="py-3 flex flex-col gap-2 items-center text-center">
          <p className="text-xs text-muted-foreground">{t("checkout.step1.openInstapayHint")}</p>
          <div className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#7C3AED] text-white font-bold text-xs">
            <ExternalLink className="size-3.5" />
            {t("checkout.step1.openInstapayButton")}
          </div>
        </CardContent>
      </Card>

      {/* CTA button — matches checkout */}
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "w-full h-11 rounded-xl text-sm font-bold transition-opacity",
          disabled
            ? "bg-primary/60 text-primary-foreground cursor-default"
            : "bg-[#0D9488] text-white hover:bg-[#0F766E] shadow-lg"
        )}
      >
        {t("checkout.step1.paidButton")}
      </button>
    </div>
  );

  if (inPhoneFrame) {
    const isThumbnail = size === "thumbnail";
    return (
      <div
        className={cn(
          "relative mx-auto rounded-[2rem] border-[3px] border-foreground/10 bg-card p-2 shadow-xl transition-all duration-300",
          isThumbnail ? "w-[180px]" : "w-[280px]",
          className
        )}
      >
        <div className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl bg-foreground/10",
          isThumbnail ? "h-4 w-16" : "h-6 w-24"
        )} />
        <div className={cn(
          "overflow-hidden rounded-[1.5rem] bg-secondary overflow-y-auto",
          isThumbnail ? "max-h-[340px] [&>div]:p-2 [&>div]:gap-2 [&>div]:text-[10px] [&>div]:pb-3" : "max-h-[520px]"
        )}>
          {content}
        </div>
      </div>
    );
  }

  return <div className={cn("rounded-xl border border-border bg-card", className)}>{content}</div>;
}
