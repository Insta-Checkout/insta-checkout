"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type SellerProfile = {
  id: string;
  fullName: string | null;
  businessName: string;
  email: string;
  whatsappNumber: string | null;
  category: string | null;
  instapayLink: string | null;
  logoUrl: string | null;
  socialLinks: { instagram: string; facebook: string; whatsapp: string };
};

export function ProfilePageContent() {
  const { t, get, locale } = useTranslations();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [instapayLink, setInstapayLink] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const getToken = () =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

  const loadProfile = async () => {
    try {
      const res = await fetchWithAuth(`${getBackendUrl()}/sellers/me`, {}, getToken);
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
      setFullName(data.fullName ?? "");
      setBusinessName(data.businessName ?? "");
      setPhone(data.whatsappNumber ? data.whatsappNumber.replace(/^20/, "0") : "");
      setCategory(data.category ?? "");
      setInstapayLink(data.instapayLink ?? "");
      setInstagram(data.socialLinks?.instagram ?? "");
      setFacebook(data.socialLinks?.facebook ?? "");
      setWhatsapp(data.socialLinks?.whatsapp ?? "");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const phoneNorm = phone.trim()
        ? phone.trim().startsWith("20")
          ? phone.trim()
          : `20${phone.trim().replace(/^0/, "")}`
        : null;

      const body: Record<string, unknown> = {
        fullName: fullName.trim() || null,
        businessName: businessName.trim(),
        whatsappNumber: phoneNorm,
        category: category || null,
        instapayLink: instapayLink.trim() || null,
        socialLinks: { instagram, facebook, whatsapp },
      };

      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        getToken
      );

      if (!res.ok) throw new Error("Failed");
      toast.success(t("dashboard.profile.saveSuccess"));
    } catch {
      toast.error(t("dashboard.profile.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const categoryValues = get<string[]>("dashboard.onboarding.categoryValues") ?? [];
  const categoryLabels = get<string[]>("dashboard.onboarding.categoryLabels") ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-cairo">
          {t("dashboard.profile.title")}
        </h1>
        <p className="text-sm text-muted-foreground font-cairo">
          {t("dashboard.profile.subtitle")}
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-cairo text-lg">{t("dashboard.profile.personalInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.fullName")}</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("dashboard.profile.fullNamePlaceholder")}
              className="font-cairo"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.email")}</Label>
            <Input
              value={profile.email}
              disabled
              className="font-cairo bg-muted"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.phone")}</Label>
            <div className="flex items-center gap-2" dir="ltr">
              <span className="flex h-10 items-center rounded-lg border border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                +20
              </span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("dashboard.profile.phonePlaceholder")}
                className="flex-1"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-cairo text-lg">{t("dashboard.profile.businessInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.businessName")}</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t("dashboard.profile.businessNamePlaceholder")}
              className="font-cairo"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.category")}</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-lg border border-input px-3 font-cairo"
            >
              <option value="">{t("dashboard.profile.chooseCategory")}</option>
              {categoryValues.map((val, i) => (
                <option key={val} value={val}>
                  {categoryLabels[i] ?? val}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* InstaPay Link */}
      <Card>
        <CardHeader>
          <CardTitle className="font-cairo text-lg">{t("dashboard.profile.instapaySection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.instapayLink")}</Label>
            <Input
              value={instapayLink}
              onChange={(e) => setInstapayLink(e.target.value)}
              placeholder={t("dashboard.onboarding.instapayLinkPlaceholder")}
              className="font-mono font-cairo"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground font-cairo">
              {t("dashboard.profile.instapayLinkHint")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="font-cairo text-lg">{t("dashboard.profile.socialLinks")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.instagram")}</Label>
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourbusiness"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.facebook")}</Label>
            <Input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="facebook.com/yourbusiness"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-cairo">{t("dashboard.profile.whatsapp")}</Label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="01XXXXXXXXX"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-xl font-cairo font-bold gap-2"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? t("dashboard.profile.saving") : t("dashboard.profile.saveChanges")}
      </Button>
    </div>
  );
}
