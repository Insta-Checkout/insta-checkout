"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

export function DashboardHomeContent() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [analRes, ordersRes] = await Promise.all([
          fetchWithAuth(`${getBackendUrl()}/sellers/me/analytics`, {}, getToken),
          fetchWithAuth(
            `${getBackendUrl()}/sellers/me/orders?limit=10`,
            {},
            getToken
          ),
        ]);

        if (!analRes.ok) {
          if (analRes.status === 401) return;
          throw new Error(`Analytics: ${analRes.status}`);
        }
        if (!ordersRes.ok) {
          if (ordersRes.status === 401) return;
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
  }, []);

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 font-cairo">الرئيسية</h1>

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
            <CardTitle className="font-cairo">الإيرادات عبر الزمن</CardTitle>
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
              <p className="py-12 text-center text-slate-500 font-cairo">
                لا توجد بيانات إيرادات بعد
              </p>
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
              <p className="py-8 text-center text-slate-500 font-cairo">
                لا يوجد طلبات حتى الآن
              </p>
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

      <div className="flex flex-wrap gap-3">
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
  );
}
