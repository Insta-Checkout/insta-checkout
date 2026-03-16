"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Link2, MessageCircle, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { QuickProductsRow } from "./QuickProductsRow";
import { RecentLinksWidget } from "./RecentLinksWidget";
import { QuickLinkModal } from "@/components/quick-link/QuickLinkModal";
import type { QuickProduct } from "./QuickProductsRow";

type Analytics = {
  totalRevenue: number;
  totalPayments: number;
  aov: number;
  activeLinksCount: number;
  revenueOverTime: { date: string; revenue: number; payments: number }[];
};

function formatEgp(n: number, egpShort: string, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n) + " " + egpShort;
}

function KpiCard({
  label,
  value,
  loading,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  loading: boolean;
  icon: React.ElementType;
}) {
  return (
    <Card className="font-cairo border-[#E4D8F0] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#6B5B7B]">{label}</CardTitle>
        <div className="w-8 h-8 bg-[#EDE9FE] rounded-full flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#7C3AED]" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <span className="text-2xl font-bold text-[#1E0A3C] font-mono">{value}</span>
        )}
      </CardContent>
    </Card>
  );
}

type DatePreset = "7d" | "30d" | "month" | "custom";

function getDateRange(preset: DatePreset, customFrom?: string, customTo?: string): { from: string; to: string } {
  const now = new Date();
  const to = customTo || now.toISOString().slice(0, 10);
  let from: string;
  if (preset === "custom" && customFrom && customTo) {
    from = customFrom;
  } else if (preset === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    from = d.toISOString().slice(0, 10);
  } else if (preset === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    from = d.toISOString().slice(0, 10);
  } else {
    from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  }
  return { from, to };
}

export function DashboardHomeContent() {
  const { t, locale } = useTranslations();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [quickProducts, setQuickProducts] = useState<QuickProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [showQuickLinkModal, setShowQuickLinkModal] = useState(false);
  const [customTo, setCustomTo] = useState("");
  const egpShort = t("common.egpShort");

  const getToken = (): Promise<string | null> =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { from, to } = getDateRange(
        datePreset,
        customFrom || undefined,
        customTo || undefined
      );
      try {
        const analRes = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me/analytics?from=${from}&to=${to}`,
          {},
          getToken
        );

        if (!analRes.ok) {
          if (analRes.status === 401) return;
          if (analRes.status === 404) {
            setAnalytics({
              totalRevenue: 0,
              totalPayments: 0,
              aov: 0,
              activeLinksCount: 0,
              revenueOverTime: [],
            });
            setLoading(false);
            return;
          }
          throw new Error(`Analytics: ${analRes.status}`);
        }

        const analData: Analytics = await analRes.json();
        setAnalytics(analData);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("dashboard.home.loadFailed"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [datePreset, customFrom, customTo, t]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const res = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me/products`,
          {},
          getToken
        );
        if (res.ok) {
          const data = await res.json();
          setQuickProducts(data.items ?? data ?? []);
        }
      } catch {
        // Products fetch is non-critical — fail silently
      }
    }
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1E0A3C] font-cairo">{t("dashboard.home.title")}</h1>
        <Card className="border-[#E4D8F0]">
          <CardContent className="py-8 text-center">
            <p className="text-[#6B5B7B] font-cairo">{error}</p>
            <Button
              variant="outline"
              className="mt-4 border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA]"
              onClick={() => window.location.reload()}
            >
              {t("dashboard.home.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmpty = !loading && analytics && analytics.totalPayments === 0;

  return (
    <div className="space-y-8">
      <OnboardingChecklist />
      <QuickProductsRow products={quickProducts} loading={loading} />

      {isEmpty && (
        <Card className="border-[#E4D8F0] bg-gradient-to-br from-[#F3EEFA] via-white to-white">
          <CardContent className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE]">
              <TrendingUp className="h-5 w-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E0A3C] font-cairo">
                {t("dashboard.home.welcome")}
              </p>
              <p className="text-xs text-[#6B5B7B] font-cairo">
                {t("dashboard.home.welcomeSubtitle")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#1E0A3C] font-cairo">{t("dashboard.home.title")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/products">
            <Button className="gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer">
              <Package className="h-4 w-4" />
              {t("dashboard.home.addProduct")}
            </Button>
          </Link>
          <Link href="/dashboard/links">
            <Button variant="outline" className="gap-2 font-cairo border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA] cursor-pointer">
              <Link2 className="h-4 w-4" />
              {t("dashboard.home.createLink")}
            </Button>
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "201000000000"}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2 font-cairo bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20 cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              {t("dashboard.home.shareWhatsApp")}
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("dashboard.home.totalRevenue")}
          value={analytics ? formatEgp(analytics.totalRevenue, egpShort, locale) : "—"}
          loading={loading}
          icon={TrendingUp}
        />
        <KpiCard
          label={t("dashboard.home.paymentCount")}
          value={analytics?.totalPayments ?? "—"}
          loading={loading}
          icon={Package}
        />
        <KpiCard
          label={t("dashboard.home.avgPaymentValue")}
          value={analytics ? formatEgp(analytics.aov, egpShort, locale) : "—"}
          loading={loading}
          icon={Package}
        />
        <KpiCard
          label={t("dashboard.home.activeLinks")}
          value={analytics?.activeLinksCount ?? "—"}
          loading={loading}
          icon={Link2}
        />
      </div>

      {/* Quick link CTA */}
      <button
        onClick={() => setShowQuickLinkModal(true)}
        className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-[#E4D8F0] bg-[#F3EEFA]/50 p-5 transition-all hover:border-[#7C3AED]/40 hover:bg-[#F3EEFA] cursor-pointer w-full text-start"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDE9FE] group-hover:bg-[#7C3AED]/20 transition-colors">
          <Link2 className="h-5 w-5 text-[#7C3AED]" />
        </div>
        <div>
          <p className="font-bold text-[#1E0A3C] font-cairo">{t("dashboard.quickLink.title")}</p>
          <p className="text-sm text-[#6B5B7B] font-cairo">{t("dashboard.quickLink.subtitle")}</p>
        </div>
      </button>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#E4D8F0] shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-cairo text-[#1E0A3C]">{t("dashboard.home.revenueOverTime")}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={datePreset}
                  onChange={(e) => {
                    const v = e.target.value as DatePreset;
                    setDatePreset(v);
                    if (v === "custom") {
                      const now = new Date();
                      const monthAgo = new Date(now);
                      monthAgo.setDate(monthAgo.getDate() - 30);
                      setCustomFrom(monthAgo.toISOString().slice(0, 10));
                      setCustomTo(now.toISOString().slice(0, 10));
                    }
                  }}
                  className="rounded-lg border border-[#E4D8F0] bg-white px-3 py-1.5 text-sm font-cairo text-[#1E0A3C]"
                >
                  <option value="7d">{t("dashboard.home.datePreset7d")}</option>
                  <option value="30d">{t("dashboard.home.datePreset30d")}</option>
                  <option value="month">{t("dashboard.home.datePresetMonth")}</option>
                  <option value="custom">{t("dashboard.home.datePresetCustom")}</option>
                </select>
                {datePreset === "custom" && (
                  <>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="rounded-lg border border-[#E4D8F0] bg-white px-2 py-1.5 text-sm font-cairo"
                    />
                    <span className="text-[#6B5B7B]">—</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="rounded-lg border border-[#E4D8F0] bg-white px-2 py-1.5 text-sm font-cairo"
                    />
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : analytics?.revenueOverTime?.length ? (
              <ResponsiveContainer width="100%" height={256}>
                <AreaChart data={analytics.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                  <Tooltip
                    formatter={(value: number) => [formatEgp(value, egpShort, locale), t("dashboard.home.revenueLabel")]}
                    labelFormatter={(label) => `${t("dashboard.home.dateLabel")}: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7C3AED"
                    fill="#7C3AED"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-[#EDE9FE] p-4">
                  <TrendingUp className="h-8 w-8 text-[#7C3AED]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#1E0A3C] font-cairo">
                  {t("dashboard.home.noRevenueData")}
                </h3>
                <p className="max-w-sm text-sm text-[#6B5B7B] font-cairo">
                  {t("dashboard.home.noRevenueSubtitle")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <RecentLinksWidget />
      </div>

      <QuickLinkModal
        open={showQuickLinkModal}
        onOpenChange={setShowQuickLinkModal}
      />
    </div>
  );
}
