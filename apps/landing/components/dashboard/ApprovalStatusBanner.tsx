"use client";

import { Clock, XCircle } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";

type ApprovalStatusBannerProps = {
  status: "pending" | "rejected" | "approved" | undefined;
  note?: string | null;
};

export function ApprovalStatusBanner({ status, note }: ApprovalStatusBannerProps) {
  const { t } = useTranslations();

  if (!status || status === "approved") return null;

  if (status === "pending") {
    return (
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Clock className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-yellow-800 font-cairo">
            {t("dashboard.approval.pendingTitle")}
          </h3>
          <p className="mt-1 text-sm text-yellow-700 font-cairo">
            {t("dashboard.approval.pendingBody")}
          </p>
          <p className="mt-1 text-xs text-yellow-600 font-cairo">
            {t("dashboard.approval.pendingNote")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        <XCircle className="h-5 w-5 text-red-600" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-red-800 font-cairo">
          {t("dashboard.approval.rejectedTitle")}
        </h3>
        {note && (
          <p className="mt-1 text-sm text-red-700 font-cairo">{note}</p>
        )}
        <p className="mt-1 text-xs text-red-600 font-cairo">
          {t("dashboard.approval.rejectedContact")}
        </p>
      </div>
    </div>
  );
}
