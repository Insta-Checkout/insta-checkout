"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, Copy, MessageCircle, Package, XCircle, CheckCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
  price?: number;
  buyerPhone?: string | null;
  buyerName?: string | null;
  screenshotUrl?: string | null;
};

function getLinkProductDisplayName(l: PaymentLink, locale: string): string {
  if (locale === "ar") return l.productNameAr || l.productName;
  return l.productNameEn || l.productName;
}

const statusClassNames: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  preview: "bg-purple-100 text-purple-700",
  paid: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  expired: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-700",
};

export function LinksPageContent() {
  const { t, locale } = useTranslations();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

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
      setError(e instanceof Error ? e.message : t("dashboard.links.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, [statusFilter]);

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(t("dashboard.links.copySuccess"));
  };

  const shareWhatsApp = (url: string, link: PaymentLink) => {
    const displayName = getLinkProductDisplayName(link, locale);
    const text = encodeURIComponent(t("dashboard.links.shareProductTemplate", { product: displayName, url }));
    window.open(
      `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "201000000000"}?text=${text}`,
      "_blank"
    )
    toast.success(t("dashboard.links.shareWhatsAppSuccess"));
  };

  const cancelLink = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/payment-links/${id}`,
        { method: "DELETE" },
        getToken
      );
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      toast.success(t("dashboard.links.cancelSuccess"));
      loadLinks();
    } catch {
      toast.error(t("dashboard.links.cancelFailed"));
    }
  };

  const confirmLink = async (id: string) => {
    setConfirmingId(id);
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/payment-links/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "confirm" }),
        },
        getToken
      );
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      toast.success(t("dashboard.links.confirmSuccess"));
      loadLinks();
    } catch {
      toast.error(t("dashboard.links.confirmFailed"));
    } finally {
      setConfirmingId(null);
    }
  };

  const statusLabels: Record<string, string> = {
    all: t("dashboard.links.all"),
    active: t("dashboard.links.active"),
    preview: t("dashboard.links.preview"),
    paid: t("dashboard.links.paid"),
    confirmed: t("dashboard.links.confirmed"),
    expired: t("dashboard.links.expired"),
    cancelled: t("dashboard.links.cancelled"),
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">{t("dashboard.links.title")}</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-slate-500 font-cairo">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => loadLinks()}>
              {t("dashboard.links.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">{t("dashboard.links.title")}</h1>
        <Link href="/dashboard/products">
          <Button variant="outline" className="gap-2 font-cairo">
            <Package className="h-4 w-4" />
            {t("dashboard.links.createFromProducts")}
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "active", "preview", "paid", "confirmed", "expired", "cancelled"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            className="font-cairo"
            onClick={() => setStatusFilter(s)}
          >
            {statusLabels[s] ?? s}
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
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center sm:flex-row sm:items-start sm:justify-center sm:text-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
              <Link2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-cairo">
                {t("dashboard.links.empty")}
              </h2>
              <p className="max-w-md text-slate-600 font-cairo">
                {t("dashboard.links.emptySubtitle")}
              </p>
              <Link href="/dashboard/products">
                <Button className="mt-2 gap-2 font-cairo">
                  <Package className="h-4 w-4" />
                  {t("dashboard.links.goToProducts")}
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
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">
                  {t("dashboard.links.product")}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">
                  {t("dashboard.links.link")}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">
                  {t("dashboard.links.status")}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">
                  {t("dashboard.links.createdAt")}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">
                  {t("dashboard.links.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => {
                const label = statusLabels[link.status] ?? link.status;
                const className = statusClassNames[link.status] ?? "bg-slate-100 text-slate-600";
                return (
                  <tr key={link.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>
                        {getLinkProductDisplayName(link, locale)}
                        {(link.status === "paid" || link.status === "confirmed") && link.buyerPhone && (
                          <p className="text-xs text-slate-500 mt-0.5 font-normal">
                            {t("dashboard.links.buyer")}: {link.buyerPhone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="max-w-[200px] truncate block text-xs text-slate-500">
                        {link.checkoutUrl || "—"}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${className}`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(link.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {link.status === "paid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 font-cairo gap-1"
                            onClick={() => confirmLink(link.id)}
                            disabled={confirmingId === link.id}
                          >
                            {confirmingId === link.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            {t("dashboard.links.confirm")}
                          </Button>
                        )}
                        {link.status === "confirmed" && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-cairo">
                            <CheckCircle className="h-4 w-4" />
                            {t("dashboard.links.confirmed")}
                          </span>
                        )}
                        {link.status === "preview" && (
                          <span className="text-xs text-purple-600 font-cairo">
                            {t("dashboard.links.completeProfile")}
                          </span>
                        )}
                        {link.checkoutUrl && link.status !== "preview" && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label={t("dashboard.links.tooltip.copy")}
                                  onClick={() => copyLink(link.checkoutUrl)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("dashboard.links.tooltip.copy")}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label={t("dashboard.links.tooltip.shareWhatsApp")}
                                  onClick={() =>
                                    shareWhatsApp(link.checkoutUrl, link)
                                  }
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("dashboard.links.tooltip.shareWhatsApp")}
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}
                        {link.status === "active" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label={t("dashboard.links.tooltip.cancel")}
                                onClick={() => cancelLink(link.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("dashboard.links.tooltip.cancel")}
                            </TooltipContent>
                          </Tooltip>
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
