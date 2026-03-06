"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Link2, MessageCircle, TrendingUp } from "lucide-react";
import { OnboardingChecklist } from "./OnboardingChecklist";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Analytics = {
  totalRevenue: number;
  totalPayments: number;
  aov: number;
  activeLinksCount: number;
  revenueOverTime: { date: string; revenue: number; payments: number }[];
};

type ConfirmedPaymentItem = {
  id: string;
  productName: string;
  price: number;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
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
    <Card className="font-cairo">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <span className="text-2xl font-bold text-slate-900 font-mono">{value}</span>
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
  const [confirmedPayments, setConfirmedPayments] = useState<ConfirmedPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const egpShort = t("common.egpShort");

  const getToken = () =>
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
        const [analRes, linksRes] = await Promise.all([
          fetchWithAuth(
            `${getBackendUrl()}/sellers/me/analytics?from=${from}&to=${to}`,
            {},
            getToken
          ),
          fetchWithAuth(
            `${getBackendUrl()}/sellers/me/payment-links?status=confirmed&limit=10`,
            {},
            getToken
          ),
        ]);

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
            setConfirmedPayments([]);
            setLoading(false);
            return;
          }
          throw new Error(`Analytics: ${analRes.status}`);
        }
        if (!linksRes.ok) {
          if (linksRes.status === 401) return;
          if (linksRes.status === 404) {
            const analData = await analRes.json();
            setAnalytics(analData);
            setConfirmedPayments([]);
            setLoading(false);
            return;
          }
          throw new Error(`Payment links: ${linksRes.status}`);
        }

        const analData: Analytics = await analRes.json();
        const linksData = await linksRes.json();
        setAnalytics(analData);
        setConfirmedPayments(linksData.items ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("dashboard.home.loadFailed"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [datePreset, customFrom, customTo, t]);

  const statusLabels: Record<string, string> = {
    confirmed: t("dashboard.links.confirmed"),
    paid: t("dashboard.links.paid"),
    active: t("dashboard.links.active"),
    cancelled: t("dashboard.links.cancelled"),
    expired: t("dashboard.links.expired"),
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">{t("dashboard.home.title")}</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-slate-500 font-cairo">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              {t("dashboard.home.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmpty = !loading && analytics && analytics.totalPayments === 0 && confirmedPayments.length === 0;

  return (
    <div className="space-y-8">
      <OnboardingChecklist />
      {isEmpty && (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:items-start sm:justify-center sm:text-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-cairo">
                {t("dashboard.home.welcome")}
              </h2>
              <p className="max-w-md text-slate-600 font-cairo">
                {t("dashboard.home.welcomeSubtitle")}
              </p>
              <Link href="/dashboard/products" className="inline-block pt-2">
                <Button className="gap-2 font-cairo">
                  <Package className="h-4 w-4" />
                  {t("dashboard.home.addFirstProduct")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">{t("dashboard.home.title")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/products">
            <Button className="gap-2 font-cairo">
              <Package className="h-4 w-4" />
              {t("dashboard.home.addProduct")}
            </Button>
          </Link>
          <Link href="/dashboard/links">
            <Button variant="outline" className="gap-2 font-cairo">
              <Link2 className="h-4 w-4" />
              {t("dashboard.home.createLink")}
            </Button>
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "201000000000"}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2 font-cairo bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-cairo">{t("dashboard.home.revenueOverTime")}</CardTitle>
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
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-cairo"
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
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-cairo"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-cairo"
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
                    stroke="#0D9488"
                    fill="#0D9488"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 font-cairo">
                  {t("dashboard.home.noRevenueData")}
                </h3>
                <p className="max-w-sm text-sm text-slate-500 font-cairo">
                  {t("dashboard.home.noRevenueSubtitle")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-cairo">{t("dashboard.home.latestConfirmed")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : confirmedPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-3">
                  <Package className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-slate-900 font-cairo">
                  {t("dashboard.home.startJourney")}
                </h3>
                <p className="mb-4 max-w-xs text-xs text-slate-500 font-cairo">
                  {t("dashboard.home.startJourneySubtitle")}
                </p>
                <Link href="/dashboard/products">
                  <Button variant="outline" size="sm" className="gap-2 font-cairo">
                    <Package className="h-3 w-3" />
                    {t("dashboard.home.addNewProduct")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {confirmedPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-900 font-cairo">
                        {p.productName}
                      </p>
                      <p className="text-sm text-slate-500 font-cairo">
                        {formatEgp(p.price, egpShort, locale)} ·{" "}
                        {statusLabels[p.status] ?? p.status}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-cairo">
                      {new Date(p.confirmedAt ?? p.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
