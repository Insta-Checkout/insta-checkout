"use client";

import { useEffect, useRef, useState } from "react";
import { auth, uploadSellerLogo } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
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
import { cn } from "@/lib/utils";

type OnboardingProgress = {
  category: boolean;
  instapayLink: boolean;
  logo: boolean;
  socialLinks: boolean;
  phoneNumber: boolean;
};

type SellerProfile = {
  id: string;
  businessName: string;
  category?: string | null;
  logoUrl?: string | null;
  whatsappNumber?: string | null;
  socialLinks?: { instagram?: string; facebook?: string; whatsapp?: string };
  contentLocale?: "en" | "ar" | null;
  onboardingComplete: boolean;
  onboardingProgress: OnboardingProgress;
};

export function OnboardingChecklist() {
  const { t, get, locale, setLocale } = useTranslations();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    logoUrl: "" as string | null,
    instagram: "",
    facebook: "",
    instapayLink: "",
    phoneNumber: "",
  });

  const [selectedLocale, setSelectedLocale] = useState<"en" | "ar">("en");

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
      const socialLinks = data.socialLinks ?? {};
      if (data.contentLocale) {
        setSelectedLocale(data.contentLocale);
      }
      setFormData({
        category: data.category ?? "",
        logoUrl: data.logoUrl ?? null,
        instagram: socialLinks.instagram ?? "",
        facebook: socialLinks.facebook ?? "",
        instapayLink: data.instapayLink ?? "",
        phoneNumber: data.whatsappNumber ?? "",
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
      const updated = {
        onboardingComplete: data.onboardingComplete ?? false,
        onboardingProgress: data.onboardingProgress,
      };
      setProfile((p) =>
        p ? { ...p, ...updated } : null
      );
      if (updated.onboardingComplete) {
        window.dispatchEvent(new CustomEvent("onboarding-complete"));
      }
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

  const saveInstapayLink = async () => {
    await saveStep("instapayLink", { instapayLink: formData.instapayLink.trim() });
  };

  const savePhoneNumber = async () => {
    const raw = formData.phoneNumber.replace(/\D/g, "");
    let normalized = raw;
    if (raw.startsWith("0") && raw.length === 11) normalized = "20" + raw.slice(1);
    else if (raw.length === 10) normalized = "20" + raw;
    await saveStep("whatsappNumber", { whatsappNumber: normalized });
  };

  const saveLanguage = async () => {
    if (!profile) return;
    setSaving("language");
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/onboarding`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentLocale: selectedLocale }),
        },
        getToken
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProfile((p) =>
        p ? { ...p, contentLocale: selectedLocale, onboardingComplete: data.onboardingComplete ?? false, onboardingProgress: data.onboardingProgress } : null
      );
      setLocale(selectedLocale);
      toast.success(t("dashboard.onboarding.saveSuccess"));
      setExpandedStep(null);
    } catch {
      toast.error(t("dashboard.onboarding.saveFailed"));
    } finally {
      setSaving(null);
    }
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
  const instapayDone = progress?.instapayLink;
  const businessInfoDone = progress?.category && progress?.socialLinks;
  const phoneDone = progress?.phoneNumber;
  const requiredDone =
    (businessInfoDone ? 1 : 0) +
    (instapayDone ? 1 : 0);
  const requiredTotal = 2;
  const pct = Math.round((requiredDone / requiredTotal) * 100);

  // Show phone step only if phone is missing (Google signup users)
  const showPhoneStep = !phoneDone;

  const categoryValues = get<string[]>("dashboard.onboarding.categoryValues") ?? [];
  const categoryLabels = get<string[]>("dashboard.onboarding.categoryLabels") ?? [];

  const steps = [
    { key: "language", labelKey: "dashboard.onboarding.languageStep", done: !!profile.contentLocale, required: false },
    { key: "category", labelKey: "dashboard.onboarding.businessType", done: businessInfoDone, required: true },
    { key: "instapayInfo", labelKey: "dashboard.onboarding.instapayLink", done: instapayDone, required: true },
    ...(showPhoneStep ? [{ key: "phoneNumber", labelKey: "dashboard.onboarding.phoneNumber", done: false, required: false }] : []),
  ];

  const isBusinessInfoValid = () => {
    if (!formData.category) return false;
    if (!formData.instagram.trim() && !formData.facebook.trim()) return false;
    return true;
  };

  const INSTAPAY_PATTERN = /^https?:\/\/(ipn\.eg|instapay\.eg)/i;

  const isInstapayFormValid = () => {
    const link = formData.instapayLink.trim();
    return link.length > 0 && INSTAPAY_PATTERN.test(link);
  };

  const isPhoneValid = () => {
    const raw = formData.phoneNumber.replace(/\D/g, "");
    return /^0?1[0-9]{9}$/.test(raw);
  };

  const instapayError = (() => {
    const link = formData.instapayLink.trim();
    if (!link) return null;
    if (!INSTAPAY_PATTERN.test(link)) return t("dashboard.onboarding.instapayLinkInvalid");
    return null;
  })();

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
              {isExpanded && (
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
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="font-cairo">{t("dashboard.onboarding.instapayLink")}</Label>
                        <Input
                          value={formData.instapayLink}
                          onChange={(e) => setFormData((p) => ({ ...p, instapayLink: e.target.value }))}
                          placeholder={t("dashboard.onboarding.instapayLinkPlaceholder")}
                          className="font-mono font-cairo"
                          dir="ltr"
                        />
                        {instapayError ? (
                          <p className="text-xs text-red-600 font-cairo">{instapayError}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground font-cairo">
                            {t("dashboard.onboarding.instapayLinkHint")}
                          </p>
                        )}
                      </div>

                      {/* Screenshot showing where to find the link */}
                      <div className="rounded-xl overflow-hidden border border-border w-fit">
                        <Image
                          src="/instapay-link-hint.png"
                          alt={t("dashboard.onboarding.instapayLinkHint")}
                          width={600}
                          height={400}
                          className="h-44 w-auto object-cover"
                          unoptimized
                        />
                      </div>

                      <Button
                        size="sm"
                        onClick={saveInstapayLink}
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
                  {step.key === "phoneNumber" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="font-cairo">{t("dashboard.onboarding.phoneNumber")}</Label>
                        <Input
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
                          placeholder={t("dashboard.onboarding.phoneNumberPlaceholder")}
                          className="font-cairo"
                          dir="ltr"
                          type="tel"
                        />
                        <p className="text-xs text-muted-foreground font-cairo">
                          {t("dashboard.onboarding.phoneNumberHint")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={savePhoneNumber}
                        disabled={!isPhoneValid() || saving === "whatsappNumber"}
                        className="gap-2 font-cairo"
                      >
                        {saving === "whatsappNumber" ? (
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
