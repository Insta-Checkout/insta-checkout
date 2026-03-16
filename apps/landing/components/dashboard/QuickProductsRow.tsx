"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";
import { fetchWithAuth, getBackendUrl } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export type QuickProduct = {
  id: string;
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  price: number;
  imageUrl: string | null;
  status: string;
};

function getDisplayName(p: QuickProduct, locale: string): string {
  if (locale === "ar") return p.nameAr || p.name;
  return p.nameEn || p.name;
}

function formatPrice(n: number, egpShort: string, locale: string): string {
  return (
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n) +
    " " +
    egpShort
  );
}

type Props = {
  products: QuickProduct[];
  loading: boolean;
};

export function QuickProductsRow({ products, loading }: Props) {
  const { t, locale } = useTranslations();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const egpShort = t("common.egpShort");

  const displayProducts = products.filter((p) => p.status === "active").slice(0, 5);

  if (loading) {
    return (
      <section className="sm:hidden space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-36 shrink-0 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) return null;

  const getToken = (): Promise<string | null> =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

  const handleGenerateLink = async (product: QuickProduct): Promise<void> => {
    setGeneratingId(product.id);
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/products/${product.id}/payment-links`,
        { method: "POST" },
        getToken
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || t("dashboard.products.createLinkFailed"));
      }
      const data = await res.json();
      try {
        await navigator.clipboard.writeText(data.checkoutUrl);
        toast.success(t("dashboard.products.linkCopied"));
      } catch {
        toast.success(t("dashboard.home.linkGenerated"));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.products.error"));
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <section className="sm:hidden space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#1E0A3C] font-cairo">
          {t("dashboard.home.yourProducts")}
        </h3>
        <Link
          href="/dashboard/products"
          className="text-sm font-medium text-[#7C3AED] hover:text-[#6D28D9] font-cairo transition-colors"
        >
          {t("dashboard.home.showAllProducts")}
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
        {displayProducts.map((product) => {
          const isGenerating = generatingId === product.id;
          return (
            <Card
              key={product.id}
              className="shrink-0 w-36 border-[#E4D8F0] shadow-sm"
            >
              <CardContent className="flex flex-col gap-2 p-3">
                <p className="text-sm font-semibold text-[#1E0A3C] font-cairo truncate">
                  {getDisplayName(product, locale)}
                </p>
                <p className="text-xs text-[#6B5B7B] font-mono">
                  {formatPrice(product.price, egpShort, locale)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isGenerating}
                  onClick={() => handleGenerateLink(product)}
                  aria-label={`${t("dashboard.home.generateLink")} — ${getDisplayName(product, locale)}`}
                  className="gap-1.5 text-xs font-cairo border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA] cursor-pointer w-full"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Link2 className="h-3 w-3" />
                  )}
                  {t("dashboard.home.generateLink")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
