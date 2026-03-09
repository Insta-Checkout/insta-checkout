"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BUSINESS_TYPES, type BusinessType } from "./smart-defaults";
import { useTranslations } from "@/lib/locale-provider";

interface BusinessTypePillsProps {
  selected: BusinessType | null;
  onSelect: (type: BusinessType) => void;
}

export function BusinessTypePills({ selected, onSelect }: BusinessTypePillsProps) {
  const { get } = useTranslations();
  const options = (get("landing.demo.businessTypeOptions") ?? []) as Array<{ value: string; label: string }>;
  const labelMap = Object.fromEntries(options.map((o) => [o.value, o.label]));

  return (
    <div className="flex flex-wrap gap-2">
      {BUSINESS_TYPES.map((type) => {
        const isSelected = selected === type.value;
        return (
          <motion.button
            key={type.value}
            type="button"
            whileTap={{ scale: 0.95 }}
            animate={isSelected ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.2 }}
            onClick={() => onSelect(type.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 min-h-[44px]",
              isSelected
                ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
                : "bg-white border border-[#E4D8F0] text-[#1E0A3C] hover:border-[#7C3AED]/40 hover:bg-[#F3EEFA]"
            )}
          >
            <span>{type.emoji}</span>
            <span>{labelMap[type.value] ?? type.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
