"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckoutPreview } from "@/components/onboarding/checkout-preview";
import { BusinessTypePills } from "./business-type-pills";
import { getDefaults, BUSINESS_TYPES, type BusinessType } from "./smart-defaults";

interface DemoFormProps {
  onCategoryChange?: (category: BusinessType) => void;
}

const FIRST_CATEGORY = BUSINESS_TYPES[0].value;

export function DemoForm({ onCategoryChange }: DemoFormProps) {
  const [selectedType, setSelectedType] = useState<BusinessType>(FIRST_CATEGORY);
  const defaults = getDefaults(FIRST_CATEGORY);
  const [productName, setProductName] = useState(defaults.defaultProduct);
  const [price, setPrice] = useState<number | "">(defaults.defaultPrice);

  // Notify parent component of initial category selection
  useEffect(() => {
    onCategoryChange?.(FIRST_CATEGORY);
  }, [onCategoryChange]);

  const handleTypeSelect = useCallback(
    (type: BusinessType) => {
      setSelectedType(type);
      const defaults = getDefaults(type);
      setProductName(defaults.defaultProduct);
      setPrice(defaults.defaultPrice);
      onCategoryChange?.(type);
    },
    [onCategoryChange]
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      {/* Form — right side in RTL */}
      <div className="flex flex-col gap-5 order-1 md:order-1">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#0F172A]">نوع البيزنس</Label>
          <BusinessTypePills selected={selectedType} onSelect={handleTypeSelect} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-product" className="text-sm font-medium text-[#0F172A]">
            اسم المنتج
          </Label>
          <Input
            id="demo-product"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="اسم المنتج"
            maxLength={100}
            className="h-12 rounded-lg border-[1.5px] border-[#CBD5E1] focus-visible:ring-2 focus-visible:ring-[#0D9488]/30 focus-visible:border-[#0D9488]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-price" className="text-sm font-medium text-[#0F172A]">
            السعر
          </Label>
          <div className="relative">
            <Input
              id="demo-price"
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              placeholder="---"
              className="h-12 rounded-lg border-[1.5px] border-[#CBD5E1] ps-14 focus-visible:ring-2 focus-visible:ring-[#0D9488]/30 focus-visible:border-[#0D9488]"
              dir="ltr"
              style={{ fontFamily: "var(--font-jetbrains), monospace" }}
            />
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#64748B] pointer-events-none">
              جنيه
            </span>
          </div>
        </div>
      </div>

      {/* Preview — left side in RTL */}
      <div className="flex items-center justify-center order-2 md:order-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckoutPreview
            businessName="اسم البيزنس بتاعك"
            productName={productName || "اسم المنتج"}
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
