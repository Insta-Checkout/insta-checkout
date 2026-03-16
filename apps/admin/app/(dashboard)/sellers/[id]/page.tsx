"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Store,
  Calendar,
  Link2,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";

type SellerDetail = {
  _id: string;
  fullName: string;
  businessName: string;
  category: string;
  email: string;
  whatsappNumber: string;
  whatsappVerified: boolean;
  onboardingComplete: boolean;
  instapayNumber: string;
  maskedName: string;
  createdAt: string;
  logoUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
};

type SellerStats = {
  totalLinks: number;
  confirmedPayments: number;
  totalVolume: number;
};

type SellerResponse = {
  seller: SellerDetail;
  stats: SellerStats;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatEGP(amount: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SellerDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<SellerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeller = useCallback(async (): Promise<void> => {
    if (!user || !id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/admin/sellers/${id}`,
        {},
        () => user.getIdToken()
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error("Seller not found");
        if (res.status === 403) throw new Error("Access denied");
        throw new Error(`Failed to load seller (${res.status})`);
      }
      const json = (await res.json()) as SellerResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load seller");
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    void fetchSeller();
  }, [fetchSeller]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none text-[#7C3AED]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/sellers")}
          className="text-[#6B5B7B] hover:text-[#1E0A3C]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sellers
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchSeller()}
              className="ml-auto border-red-200 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return <></>;

  const { seller, stats } = data;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/sellers")}
        className="text-[#6B5B7B] hover:text-[#1E0A3C]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sellers
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-[#1E0A3C] font-heading">
          {seller.businessName || seller.fullName}
        </h1>
        {seller.businessName && seller.fullName && (
          <p className="mt-1 text-sm text-[#6B5B7B]">{seller.fullName}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[#E4D8F0] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#6B5B7B]">
              Payment Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-[#7C3AED]" />
              <span className="text-2xl font-bold text-[#1E0A3C] font-heading">
                {stats.totalLinks}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E4D8F0] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#6B5B7B]">
              Confirmed Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-[#1E0A3C] font-heading">
                {stats.confirmedPayments}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E4D8F0] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#6B5B7B]">
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#7C3AED]" />
              <span className="text-2xl font-bold text-[#1E0A3C] font-heading">
                {formatEGP(stats.totalVolume)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E4D8F0] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E0A3C]">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={<Store className="h-4 w-4 text-[#7C3AED]" />}
              label="Category"
              value={seller.category || "—"}
            />
            <InfoItem
              icon={<Mail className="h-4 w-4 text-[#7C3AED]" />}
              label="Email"
              value={seller.email}
            />
            <InfoItem
              icon={<Phone className="h-4 w-4 text-[#7C3AED]" />}
              label="WhatsApp"
              value={seller.whatsappNumber || "—"}
            />
            <InfoItem
              icon={<Calendar className="h-4 w-4 text-[#7C3AED]" />}
              label="Signed Up"
              value={seller.createdAt ? formatDate(seller.createdAt) : "—"}
            />
            <InfoItem
              icon={<CheckCircle className={`h-4 w-4 ${seller.whatsappVerified ? "text-green-500" : "text-[#C4B5D0]"}`} />}
              label="WhatsApp Verified"
              value={seller.whatsappVerified ? "Yes" : "No"}
            />
            <InfoItem
              icon={<CheckCircle className={`h-4 w-4 ${seller.onboardingComplete ? "text-green-500" : "text-[#C4B5D0]"}`} />}
              label="Onboarding Complete"
              value={seller.onboardingComplete ? "Yes" : "No"}
            />
            {seller.instapayNumber && (
              <InfoItem
                icon={<DollarSign className="h-4 w-4 text-[#7C3AED]" />}
                label="InstaPay Number"
                value={seller.instapayNumber}
              />
            )}
            {seller.maskedName && (
              <InfoItem
                icon={<Store className="h-4 w-4 text-[#7C3AED]" />}
                label="Masked Name"
                value={seller.maskedName}
              />
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <dt className="text-xs font-medium text-[#6B5B7B]">{label}</dt>
        <dd className="mt-0.5 text-sm text-[#1E0A3C]">{value}</dd>
      </div>
    </div>
  );
}
