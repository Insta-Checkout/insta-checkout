"use client";

import { useTranslations } from "@/lib/locale-provider";

export function OnboardPageHeader() {
  const { t } = useTranslations();
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M7 12h10M12 7v10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        {t("onboard.page.title")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("onboard.page.signupSubtitle")}
      </p>
    </div>
  );
}
