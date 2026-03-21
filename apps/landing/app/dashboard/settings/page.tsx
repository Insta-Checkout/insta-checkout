"use client";

import { useTranslations } from "@/lib/locale-provider";

export default function SettingsPage() {
  const { t } = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E0A3C] font-cairo">{t("dashboard.settings.title")}</h1>
      <p className="mt-2 text-[#6B5B7B] font-cairo">{t("dashboard.settings.subtitle")}</p>
    </div>
  );
}
