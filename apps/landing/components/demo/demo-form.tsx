"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckoutPreview } from "@/components/onboarding/checkout-preview";
import { BusinessTypePills } from "./business-type-pills";
import { getDefaults, BUSINESS_TYPES, type BusinessType } from "./smart-defaults";
import { useTranslations } from "@/lib/locale-provider";

interface DemoFormProps {
  onCategoryChange?: (category: BusinessType) => void;
}

const FIRST_CATEGORY = BUSINESS_TYPES[0].value;

export function DemoForm({ onCategoryChange }: DemoFormProps) {
  const { t, get } = useTranslations();
  const businessTypeOptions = (get("landing.demo.businessTypeOptions") ?? []) as Array<{
    value: string;
    defaultProduct: string;
    defaultPrice: number;
  }>;

  const getLocalizedDefaults = (type: BusinessType) => {
    const localized = businessTypeOptions.find((o) => o.value === type);
    const base = getDefaults(type);
    return {
      defaultProduct: localized?.defaultProduct ?? base.defaultProduct,
      defaultPrice: localized?.defaultPrice ?? base.defaultPrice,
    };
  };

  const [selectedType, setSelectedType] = useState<BusinessType>(FIRST_CATEGORY);
  const initial = getDefaults(FIRST_CATEGORY);
  const [productName, setProductName] = useState(initial.defaultProduct);
  const [price, setPrice] = useState<number | "">(initial.defaultPrice);

  useEffect(() => {
    onCategoryChange?.(FIRST_CATEGORY);
  }, [onCategoryChange]);

  // Keep product name in sync when locale changes
  useEffect(() => {
    const localized = getLocalizedDefaults(selectedType);
    setProductName(localized.defaultProduct);
    setPrice(localized.defaultPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessTypeOptions.length]);

  const handleTypeSelect = useCallback(
    (type: BusinessType) => {
      setSelectedType(type);
      const localized = businessTypeOptions.find((o) => o.value === type);
      const base = getDefaults(type);
      setProductName(localized?.defaultProduct ?? base.defaultProduct);
      setPrice(localized?.defaultPrice ?? base.defaultPrice);
      onCategoryChange?.(type);
    },
    [onCategoryChange, businessTypeOptions]
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      {/* Form */}
      <div className="flex flex-col gap-5 order-1 md:order-1">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#1E0A3C]">
            {t("landing.demo.businessType")}
          </Label>
          <BusinessTypePills selected={selectedType} onSelect={handleTypeSelect} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-product" className="text-sm font-medium text-[#1E0A3C]">
            {t("landing.demo.productName")}
          </Label>
          <Input
            id="demo-product"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={t("landing.demo.productPlaceholder")}
            maxLength={100}
            className="h-12 rounded-lg border-[1.5px] border-[#E4D8F0] focus-visible:ring-2 focus-visible:ring-[#7C3AED]/30 focus-visible:border-[#7C3AED]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-price" className="text-sm font-medium text-[#1E0A3C]">
            {t("landing.demo.price")}
          </Label>
          <div className="relative">
            <Input
              id="demo-price"
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              placeholder="---"
              className="h-12 rounded-lg border-[1.5px] border-[#E4D8F0] ps-14 focus-visible:ring-2 focus-visible:ring-[#7C3AED]/30 focus-visible:border-[#7C3AED]"
              dir="ltr"
              style={{ fontFamily: "var(--font-jetbrains), monospace" }}
            />
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#64748B] pointer-events-none">
              {t("common.egp")}
            </span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center justify-center order-2 md:order-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckoutPreview
            businessName={t("landing.demo.previewBusinessName")}
            productName={productName || t("landing.demo.previewProductDefault")}
            price={typeof price === "number" ? price : 0}
            businessType={selectedType}
            inPhoneFrame
            disabled
          />
        </motion.div>
      </div>
    </div>
  );
}
