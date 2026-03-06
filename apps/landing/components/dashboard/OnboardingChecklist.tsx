"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Circle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

type OnboardingProgress = {
  category: boolean;
  instapayNumber: boolean;
  maskedName: boolean;
  logo: boolean;
  socialLinks: boolean;
};

type SellerProfile = {
  id: string;
  businessName: string;
  onboardingComplete: boolean;
  onboardingProgress: OnboardingProgress;
};

export function OnboardingChecklist() {
  const { t, get } = useTranslations();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    instapayNumber: "",
    maskedFullName: "",
  });

  const getToken = () =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

  const loadProfile = async () => {
    try {
      const res = await fetchWithAuth(`${getBackendUrl()}/sellers/me`, {}, getToken);
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
      setFormData({
        category: data.category ?? "",
        instapayNumber: data.instapayNumber ?? "",
        maskedFullName: data.maskedFullName ?? "",
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveStep = async (field: string, value: string | Record<string, string>) => {
    if (!profile) return;
    setSaving(field);
    try {
      const body = typeof value === "string" ? { [field]: value } : value;
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/onboarding`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        getToken
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProfile((p) =>
        p
          ? {
              ...p,
              onboardingComplete: data.onboardingComplete ?? p.onboardingComplete,
              onboardingProgress: data.onboardingProgress ?? p.onboardingProgress,
            }
          : null
      );
      toast.success(t("dashboard.onboarding.saveSuccess"));
      setExpandedStep(null);
    } catch {
      toast.error(t("dashboard.onboarding.saveFailed"));
    } finally {
      setSaving(null);
    }
  };

  if (loading || !profile || profile.onboardingComplete) return null;

  const progress = profile.onboardingProgress;
  const requiredDone =
    (progress?.category ? 1 : 0) +
    (progress?.instapayNumber ? 1 : 0) +
    (progress?.maskedName ? 1 : 0);
  const requiredTotal = 3;
  const pct = Math.round((requiredDone / requiredTotal) * 100);

  const categoryValues = get<string[]>("dashboard.onboarding.categoryValues") ?? [];
  const categoryLabels = get<string[]>("dashboard.onboarding.categoryLabels") ?? [];
  const steps = [
    { key: "category", labelKey: "dashboard.onboarding.businessType", done: progress?.category, required: true },
    { key: "instapayNumber", labelKey: "dashboard.onboarding.instapayNumber", done: progress?.instapayNumber, required: true },
    { key: "maskedName", labelKey: "dashboard.onboarding.maskedName", done: progress?.maskedName, required: true },
  ];

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-cairo text-lg">
            {t("dashboard.onboarding.completeTitle")}
          </CardTitle>
          <span className="text-sm font-medium text-primary font-cairo">
            {t("dashboard.onboarding.progress", { done: String(requiredDone), total: String(requiredTotal), pct: String(pct) })}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step) => {
          const isExpanded = expandedStep === step.key;
          return (
            <div
              key={step.key}
              className="rounded-lg border border-border bg-card"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedStep(isExpanded ? null : step.key)
                }
                className="flex w-full items-center justify-between px-4 py-3 text-start font-cairo"
              >
                <span className="flex items-center gap-2">
                  {step.done ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {t(step.labelKey)}
                  {step.required && (
                    <span className="text-xs text-muted-foreground">*</span>
                  )}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isExpanded && !step.done && (
                <div className="border-t border-border px-4 py-3 space-y-3">
                  {step.key === "category" && (
                    <div className="space-y-2">
                      <Label className="font-cairo">{t("dashboard.onboarding.businessType")}</Label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        className="w-full h-10 rounded-lg border border-input px-3 font-cairo"
                      >
                        <option value="">{t("dashboard.onboarding.choose")}</option>
                        {categoryValues.map((val, i) => (
                          <option key={val} value={val}>
                            {categoryLabels[i] ?? val}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={() => saveStep("category", formData.category)}
                        disabled={!formData.category || saving === "category"}
                        className="gap-2 font-cairo"
                      >
                        {saving === "category" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {t("dashboard.onboarding.save")}
                      </Button>
                    </div>
                  )}
                  {step.key === "instapayNumber" && (
                    <div className="space-y-2">
                      <Label className="font-cairo">{t("dashboard.onboarding.instapayNumber")}</Label>
                      <Input
                        value={formData.instapayNumber}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            instapayNumber: e.target.value,
                          }))
                        }
                        placeholder={t("dashboard.onboarding.instapayPlaceholder")}
                        className="font-mono font-cairo"
                        dir="ltr"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          saveStep("instapayNumber", formData.instapayNumber)
                        }
                        disabled={
                          !formData.instapayNumber || saving === "instapayNumber"
                        }
                        className="gap-2 font-cairo"
                      >
                        {saving === "instapayNumber" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {t("dashboard.onboarding.save")}
                      </Button>
                    </div>
                  )}
                  {step.key === "maskedName" && (
                    <div className="space-y-2">
                      <Label className="font-cairo">{t("dashboard.onboarding.maskedName")}</Label>
                      <Input
                        value={formData.maskedFullName}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            maskedFullName: e.target.value,
                          }))
                        }
                        placeholder={t("dashboard.onboarding.maskedPlaceholder")}
                        className="font-cairo"
                      />
                      <p className="text-xs text-muted-foreground font-cairo">
                        {t("dashboard.onboarding.maskedHint")}
                      </p>
                      <Button
                        size="sm"
                        onClick={() =>
                          saveStep("maskedFullName", formData.maskedFullName)
                        }
                        disabled={
                          !formData.maskedFullName ||
                          !formData.maskedFullName.includes("*") ||
                          saving === "maskedFullName"
                        }
                        className="gap-2 font-cairo"
                      >
                        {saving === "maskedFullName" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {t("dashboard.onboarding.save")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
