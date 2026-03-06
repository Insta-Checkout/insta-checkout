"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Link2, MessageCircle, TrendingUp, Calendar } from "lucide-react";
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
  totalOrders: number;
  aov: number;
  activeLinksCount: number;
  revenueOverTime: { date: string; revenue: number; orders: number }[];
};

type OrderItem = {
  orderId: string;
  productName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
};

type OrdersResponse = {
  items: OrderItem[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
};

function formatEgp(n: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n) + " ج.م";
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
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

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
        const [analRes, ordersRes] = await Promise.all([
          fetchWithAuth(
            `${getBackendUrl()}/sellers/me/analytics?from=${from}&to=${to}`,
            {},
            getToken
          ),
          fetchWithAuth(
            `${getBackendUrl()}/sellers/me/orders?limit=10`,
            {},
            getToken
          ),
        ]);

        if (!analRes.ok) {
          if (analRes.status === 401) return;
          if (analRes.status === 404) {
            setAnalytics({
              totalRevenue: 0,
              totalOrders: 0,
              aov: 0,
              activeLinksCount: 0,
              revenueOverTime: [],
            });
            setOrders([]);
            setLoading(false);
            return;
          }
          throw new Error(`Analytics: ${analRes.status}`);
        }
        if (!ordersRes.ok) {
          if (ordersRes.status === 401) return;
          if (ordersRes.status === 404) {
            const analData = await analRes.json();
            setAnalytics(analData);
            setOrders([]);
            setLoading(false);
            return;
          }
          throw new Error(`Orders: ${ordersRes.status}`);
        }

        const analData: Analytics = await analRes.json();
        const ordersData: OrdersResponse = await ordersRes.json();
        setAnalytics(analData);
        setOrders(ordersData.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : "فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [datePreset, customFrom, customTo]);

  const statusLabels: Record<string, string> = {
    confirmed: "مدفوع",
    paid: "مدفوع",
    pending: "قيد الانتظار",
    cancelled: "ملغي",
    rejected: "مرفوض",
    failed: "فشل",
    expired: "منتهي",
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">الرئيسية</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-slate-500 font-cairo">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmpty = !loading && analytics && analytics.totalOrders === 0 && orders.length === 0;

  return (
    <div className="space-y-8">
      {isEmpty && (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:text-right">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-cairo">
                مرحباً بك في لوحة التحكم
              </h2>
              <p className="max-w-md text-slate-600 font-cairo">
                بمجرد استلام طلبك الأول، ستظهر هنا إحصائيات تفصيلية عن إيراداتك وطلباتك وأدائك المالي.
              </p>
              <Link href="/dashboard/products" className="inline-block pt-2">
                <Button className="gap-2 font-cairo">
                  <Package className="h-4 w-4" />
                  إضافة منتجك الأول
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">الرئيسية</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/products">
            <Button className="gap-2 font-cairo">
              <Package className="h-4 w-4" />
              إضافة منتج
            </Button>
          </Link>
          <Link href="/dashboard/links">
            <Button variant="outline" className="gap-2 font-cairo">
              <Link2 className="h-4 w-4" />
              إنشاء لينك دفع
            </Button>
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "201000000000"}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2 font-cairo bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20">
              <MessageCircle className="h-4 w-4" />
              مشاركة على واتساب
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="إجمالي الإيرادات"
          value={analytics ? formatEgp(analytics.totalRevenue) : "—"}
          loading={loading}
          icon={TrendingUp}
        />
        <KpiCard
          label="عدد الطلبات"
          value={analytics?.totalOrders ?? "—"}
          loading={loading}
          icon={Package}
        />
        <KpiCard
          label="متوسط قيمة الطلب"
          value={analytics ? formatEgp(analytics.aov) : "—"}
          loading={loading}
          icon={Package}
        />
        <KpiCard
          label="لينكات نشطة"
          value={analytics?.activeLinksCount ?? "—"}
          loading={loading}
          icon={Link2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-cairo">الإيرادات عبر الزمن</CardTitle>
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
                  <option value="7d">آخر 7 أيام</option>
                  <option value="30d">آخر 30 يوم</option>
                  <option value="month">هذا الشهر</option>
                  <option value="custom">نطاق مخصص</option>
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
                    formatter={(value: number) => [formatEgp(value), "الإيرادات"]}
                    labelFormatter={(label) => `التاريخ: ${label}`}
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
                  لا توجد بيانات إيرادات بعد
                </h3>
                <p className="max-w-sm text-sm text-slate-500 font-cairo">
                  بمجرد استلام طلبك الأول، ستظهر هنا رسوم بيانية تفصيلية توضح نمو مبيعاتك وأدائك المالي.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-cairo">أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-3">
                  <Package className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-slate-900 font-cairo">
                  ابدأ رحلتك
                </h3>
                <p className="mb-4 max-w-xs text-xs text-slate-500 font-cairo">
                  أنشئ منتجك الأول وشاركه مع عملائك لتبدأ في استقبال الطلبات.
                </p>
                <Link href="/dashboard/products">
                  <Button variant="outline" size="sm" className="gap-2 font-cairo">
                    <Package className="h-3 w-3" />
                    إضافة منتج جديد
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <div
                    key={o.orderId}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-900 font-cairo">
                        {o.productName}
                      </p>
                      <p className="text-sm text-slate-500 font-cairo">
                        {formatEgp(o.amount)} ·{" "}
                        {statusLabels[o.status] ?? o.status}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-cairo">
                      {new Date(o.createdAt).toLocaleDateString("ar-EG")}
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
