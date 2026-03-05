"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, Copy, MessageCircle, Package, XCircle } from "lucide-react";
import { toast } from "sonner";

type PaymentLink = {
  id: string;
  productName: string;
  productNameAr?: string | null;
  productNameEn?: string | null;
  checkoutUrl: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
};

function getLinkProductDisplayName(l: PaymentLink, locale: string): string {
  if (locale === "ar") return l.productNameAr || l.productName;
  return l.productNameEn || l.productName;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "نشط", className: "bg-blue-100 text-blue-700" },
  paid: { label: "مدفوع", className: "bg-emerald-100 text-emerald-700" },
  expired: { label: "منتهي", className: "bg-slate-100 text-slate-600" },
  cancelled: { label: "ملغي", className: "bg-red-100 text-red-700" },
};

export function LinksPageContent() {
  const { locale } = useTranslations();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getToken = () =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

  const loadLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/payment-links?${params}`,
        {},
        getToken
      );
      if (!res.ok) {
        if (res.status === 401) return;
        if (res.status === 404) {
          setLinks([]);
          setLoading(false);
          return;
        }
        throw new Error(`Failed: ${res.status}`);
      }
      const data = await res.json();
      setLinks(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل اللينكات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, [statusFilter]);

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("تم نسخ اللينك")
  };

  const shareWhatsApp = (url: string, link: PaymentLink) => {
    const displayName = getLinkProductDisplayName(link, locale);
    const text = encodeURIComponent(`المنتج: ${displayName}\nلينك الدفع: ${url}`)
    window.open(
      `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "201000000000"}?text=${text}`,
      "_blank"
    )
  };

  const cancelLink = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/payment-links/${id}`,
        { method: "DELETE" },
        getToken
      );
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      toast.success("تم إلغاء اللينك");
      loadLinks();
    } catch {
      toast.error("فشل إلغاء اللينك");
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">لينكات الدفع</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-slate-500 font-cairo">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => loadLinks()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">لينكات الدفع</h1>
        <Link href="/dashboard/products">
          <Button variant="outline" className="gap-2 font-cairo">
            <Package className="h-4 w-4" />
            إنشاء لينك من المنتجات
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "active", "paid", "expired", "cancelled"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            className="font-cairo"
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "الكل" : statusConfig[s]?.label ?? s}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center sm:flex-row sm:text-right">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
              <Link2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-cairo">
                لا يوجد لينكات دفع حتى الآن
              </h2>
              <p className="max-w-md text-slate-600 font-cairo">
                أنشئ منتجاً أولاً، ثم أنشئ لينك دفع منه لشاركه مع عملائك. بمجرد إنشاء اللينك، ستظهر هنا جميع لينكاتك مع إمكانية النسخ والمشاركة.
              </p>
              <Link href="/dashboard/products">
                <Button className="mt-2 gap-2 font-cairo">
                  <Package className="h-4 w-4" />
                  الذهاب للمنتجات
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full font-cairo">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                  المنتج
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                  اللينك
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                  تاريخ الإنشاء
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => {
                const sc = statusConfig[link.status] ?? {
                  label: link.status,
                  className: "bg-slate-100 text-slate-600",
                };
                return (
                  <tr key={link.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {getLinkProductDisplayName(link, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <code className="max-w-[200px] truncate block text-xs text-slate-500">
                        {link.checkoutUrl || "—"}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${sc.className}`}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(link.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {link.checkoutUrl && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyLink(link.checkoutUrl)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                shareWhatsApp(link.checkoutUrl, link)
                              }
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {link.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => cancelLink(link.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
