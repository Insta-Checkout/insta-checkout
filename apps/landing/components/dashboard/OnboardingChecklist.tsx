"use client";

import { useEffect, useRef, useState } from "react";
import { auth, uploadSellerLogo } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  X,
  Instagram,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

type OnboardingProgress = {
  category: boolean;
  instapayInfo: boolean;
  instapayNumber: boolean;
  maskedName: boolean;
  logo: boolean;
  socialLinks: boolean;
};

type SellerProfile = {
  id: string;
  businessName: string;
  category?: string | null;
  logoUrl?: string | null;
  socialLinks?: { instagram?: string; facebook?: string; whatsapp?: string };
  onboardingComplete: boolean;
  onboardingProgress: OnboardingProgress;
};

type InstapayMethod = "mobile" | "bank" | "ipa" | "";

export function OnboardingChecklist() {
  const { t, get, locale } = useTranslations();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    logoUrl: "" as string | null,
    instagram: "",
    facebook: "",
    instapayMethod: "" as InstapayMethod,
    instapayMobile: "",
    instapayBankName: "",
    instapayBankAccount: "",
    instapayIpa: "",
    maskedFullName: "",
  });

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const getToken = () =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

  const loadProfile = async () => {
    try {
      const res = await fetchWithAuth(`${getBackendUrl()}/sellers/me`, {}, getToken);
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
      const instapayInfo = data.instapayInfo ?? {};
      const socialLinks = data.socialLinks ?? {};
      setFormData({
        category: data.category ?? "",
        logoUrl: data.logoUrl ?? null,
        instagram: socialLinks.instagram ?? "",
        facebook: socialLinks.facebook ?? "",
        instapayMethod: (instapayInfo.method ?? "") as InstapayMethod,
        instapayMobile: instapayInfo.mobile ?? data.instapayNumber ?? "",
        instapayBankName: instapayInfo.bankName ?? "",
        instapayBankAccount: instapayInfo.bankAccountNumber ?? "",
        instapayIpa: instapayInfo.ipaAddress ?? "",
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

  const saveStep = async (field: string, value: string | Record<string, unknown>) => {
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

  const saveBusinessInfo = async () => {
    await saveStep("category", {
      category: formData.category,
      logoUrl: formData.logoUrl || null,
      socialLinks: {
        instagram: formData.instagram.trim(),
        facebook: formData.facebook.trim(),
        whatsapp: "",
      },
    });
  };

  const saveInstapayInfo = async () => {
    const method = formData.instapayMethod;
    if (!method) return;

    const instapayInfo: Record<string, unknown> = { method };
    if (method === "mobile") instapayInfo.mobile = formData.instapayMobile;
    if (method === "bank") {
      instapayInfo.bankName = formData.instapayBankName;
      instapayInfo.bankAccountNumber = formData.instapayBankAccount;
    }
    if (method === "ipa") instapayInfo.ipaAddress = formData.instapayIpa;

    await saveStep("instapayInfo", {
      instapayInfo,
      maskedFullName: formData.maskedFullName,
    });
  };

  const handleLogoUpload = async (file: File) => {
    if (!auth.currentUser) return;
    if (!file.type.startsWith("image/")) {
      toast.error(
        locale === "ar"
          ? "الرجاء اختيار ملف صورة صالح"
          : "Please choose a valid image file"
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        locale === "ar"
          ? "حجم الصورة كبير جداً. الحد الأقصى 5 ميغابايت"
          : "Image is too large. Maximum size is 5 MB"
      );
      return;
    }
    setUploadingLogo(true);
    try {
      const url = await uploadSellerLogo(file, auth.currentUser.uid);
      setFormData((p) => ({ ...p, logoUrl: url }));
    } catch {
      toast.error(
        locale === "ar" ? "فشل رفع الصورة" : "Failed to upload image"
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading || !profile || profile.onboardingComplete) return null;

  const progress = profile.onboardingProgress;
  const instapayDone = progress?.instapayInfo || progress?.instapayNumber;
  const businessInfoDone = progress?.category && progress?.socialLinks;
  const requiredDone =
    (businessInfoDone ? 1 : 0) +
    (instapayDone && progress?.maskedName ? 1 : 0);
  const requiredTotal = 2;
  const pct = Math.round((requiredDone / requiredTotal) * 100);

  const categoryValues = get<string[]>("dashboard.onboarding.categoryValues") ?? [];
  const categoryLabels = get<string[]>("dashboard.onboarding.categoryLabels") ?? [];
  const bankNames = get<string[]>("dashboard.onboarding.bankNames") ?? [];

  const steps = [
    { key: "category", labelKey: "dashboard.onboarding.businessType", done: businessInfoDone, required: true },
    { key: "instapayInfo", labelKey: "dashboard.onboarding.instapayInfo", done: instapayDone && progress?.maskedName, required: true },
  ];

  const isBusinessInfoValid = () => {
    if (!formData.category) return false;
    if (!formData.instagram.trim() && !formData.facebook.trim()) return false;
    return true;
  };

  const isInstapayFormValid = () => {
    if (!formData.instapayMethod) return false;
    if (formData.instapayMethod === "mobile" && !formData.instapayMobile) return false;
    if (formData.instapayMethod === "bank" && (!formData.instapayBankName || !formData.instapayBankAccount)) return false;
    if (formData.instapayMethod === "ipa" && !formData.instapayIpa) return false;
    if (!formData.maskedFullName || !formData.maskedFullName.includes("*")) return false;
    return true;
  };

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
                    <div className="space-y-4">
                      {/* Business category */}
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
                      </div>

                      {/* Business logo (optional) */}
                      <div className="space-y-2">
                        <Label className="font-cairo">{t("dashboard.onboarding.businessLogo")}</Label>
                        {formData.logoUrl ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={formData.logoUrl}
                              alt="Logo"
                              className="h-16 w-16 rounded-lg object-cover border border-border"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData((p) => ({ ...p, logoUrl: null }))}
                              className="text-destructive hover:text-destructive gap-1 font-cairo"
                            >
                              <X className="h-3.5 w-3.5" />
                              {t("dashboard.onboarding.removeLogo")}
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={uploadingLogo}
                              className="gap-2 font-cairo"
                            >
                              {uploadingLogo ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ImagePlus className="h-4 w-4" />
                              )}
                              {t("dashboard.onboarding.uploadLogo")}
                            </Button>
                            <p className="mt-1 text-xs text-muted-foreground font-cairo">
                              {t("dashboard.onboarding.logoHint")}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Social media links */}
                      <div className="space-y-2 border-t border-border pt-3">
                        <Label className="font-cairo">{t("dashboard.onboarding.socialLinksLabel")}</Label>
                        <p className="text-xs text-muted-foreground font-cairo">
                          {t("dashboard.onboarding.socialLinksHint")}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Instagram className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Input
                              value={formData.instagram}
                              onChange={(e) => setFormData((p) => ({ ...p, instagram: e.target.value }))}
                              placeholder={t("dashboard.onboarding.instagramPlaceholder")}
                              className="font-cairo"
                              dir="ltr"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Facebook className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Input
                              value={formData.facebook}
                              onChange={(e) => setFormData((p) => ({ ...p, facebook: e.target.value }))}
                              placeholder={t("dashboard.onboarding.facebookPlaceholder")}
                              className="font-cairo"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={saveBusinessInfo}
                        disabled={!isBusinessInfoValid() || saving === "category" || uploadingLogo}
                        className="gap-2 font-cairo"
                      >
                        {saving === "category" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {t("dashboard.onboarding.save")}
                      </Button>
                    </div>
                  )}
                  {step.key === "instapayInfo" && (
                    <div className="space-y-4">
                      {/* Method selector */}
                      <div className="space-y-2">
                        <Label className="font-cairo">{t("dashboard.onboarding.instapayMethod")}</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["mobile", "bank", "ipa"] as const).map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setFormData((p) => ({ ...p, instapayMethod: method }))}
                              className={`rounded-lg border px-3 py-2 text-sm font-cairo transition-colors ${
                                formData.instapayMethod === method
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/30"
                              }`}
                            >
                              {t(`dashboard.onboarding.method${method.charAt(0).toUpperCase() + method.slice(1)}`)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Method-specific fields */}
                      {formData.instapayMethod === "mobile" && (
                        <div className="space-y-2">
                          <Label className="font-cairo">{t("dashboard.onboarding.mobileNumber")}</Label>
                          <Input
                            value={formData.instapayMobile}
                            onChange={(e) => setFormData((p) => ({ ...p, instapayMobile: e.target.value }))}
                            placeholder={t("dashboard.onboarding.mobilePlaceholder")}
                            className="font-mono font-cairo"
                            dir="ltr"
                          />
                        </div>
                      )}

                      {formData.instapayMethod === "bank" && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="font-cairo">{t("dashboard.onboarding.bankName")}</Label>
                            <select
                              value={formData.instapayBankName}
                              onChange={(e) => setFormData((p) => ({ ...p, instapayBankName: e.target.value }))}
                              className="w-full h-10 rounded-lg border border-input px-3 font-cairo"
                            >
                              <option value="">{t("dashboard.onboarding.bankNamePlaceholder")}</option>
                              {bankNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-cairo">{t("dashboard.onboarding.bankAccountNumber")}</Label>
                            <Input
                              value={formData.instapayBankAccount}
                              onChange={(e) => setFormData((p) => ({ ...p, instapayBankAccount: e.target.value }))}
                              placeholder={t("dashboard.onboarding.bankAccountPlaceholder")}
                              className="font-mono font-cairo"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      )}

                      {formData.instapayMethod === "ipa" && (
                        <div className="space-y-2">
                          <Label className="font-cairo">{t("dashboard.onboarding.ipaAddress")}</Label>
                          <Input
                            value={formData.instapayIpa}
                            onChange={(e) => setFormData((p) => ({ ...p, instapayIpa: e.target.value }))}
                            placeholder={t("dashboard.onboarding.ipaPlaceholder")}
                            className="font-cairo"
                            dir="ltr"
                          />
                        </div>
                      )}

                      {/* Masked name — grouped under InstaPay Info */}
                      {formData.instapayMethod && (
                        <div className="space-y-2 border-t border-border pt-3">
                          <Label className="font-cairo">{t("dashboard.onboarding.maskedName")}</Label>
                          <Input
                            value={formData.maskedFullName}
                            onChange={(e) => setFormData((p) => ({ ...p, maskedFullName: e.target.value }))}
                            placeholder={t("dashboard.onboarding.maskedPlaceholder")}
                            className="font-cairo"
                          />
                          <p className="text-xs text-muted-foreground font-cairo">
                            {t("dashboard.onboarding.maskedHint")}
                          </p>
                        </div>
                      )}

                      <Button
                        size="sm"
                        onClick={saveInstapayInfo}
                        disabled={!isInstapayFormValid() || saving === "instapayInfo"}
                        className="gap-2 font-cairo"
                      >
                        {saving === "instapayInfo" ? (
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
