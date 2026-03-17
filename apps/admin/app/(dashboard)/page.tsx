"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Users, Link2, CheckCircle, DollarSign, AlertCircle, RefreshCw, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";

type Analytics = {
  totalSellers: number;
  totalPaymentLinks: number;
  totalConfirmedPayments: number;
  totalVolume: number;
  sellersByApprovalStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
};

function formatEGP(amount: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (): Promise<void> => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/admin/analytics`,
        {},
        () => user.getIdToken()
      );
      if (!res.ok) {
        throw new Error(res.status === 403 ? "Access denied" : `Failed to load analytics (${res.status})`);
      }
      const data = (await res.json()) as Analytics;
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const statCards = [
    { label: "Total Sellers", value: analytics?.totalSellers, icon: Users, format: (v: number) => v.toLocaleString() },
    { label: "Payment Links", value: analytics?.totalPaymentLinks, icon: Link2, format: (v: number) => v.toLocaleString() },
    { label: "Confirmed Payments", value: analytics?.totalConfirmedPayments, icon: CheckCircle, format: (v: number) => v.toLocaleString() },
    { label: "Total Volume", value: analytics?.totalVolume, icon: DollarSign, format: (v: number) => formatEGP(v) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E0A3C] font-heading">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6B5B7B]">
            Platform overview and key metrics.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchAnalytics()}
          disabled={loading}
          className="border-[#E4D8F0] text-[#6B5B7B] hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchAnalytics()}
              className="ml-auto border-red-200 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, format }) => (
          <Card key={label} className="border-[#E4D8F0] shadow-sm">
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
                <p className="text-3xl font-bold text-[#1E0A3C] font-heading">
                  {value != null ? format(value) : "—"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approval status breakdown */}
      {analytics?.sellersByApprovalStatus && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-yellow-200 shadow-sm">
            <CardContent className="flex items-center gap-3 py-4">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-[#1E0A3C] font-heading">
                  {analytics.sellersByApprovalStatus.pending}
                </p>
                <p className="text-xs text-[#6B5B7B]">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 shadow-sm">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-[#1E0A3C] font-heading">
                  {analytics.sellersByApprovalStatus.approved}
                </p>
                <p className="text-xs text-[#6B5B7B]">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 shadow-sm">
            <CardContent className="flex items-center gap-3 py-4">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-[#1E0A3C] font-heading">
                  {analytics.sellersByApprovalStatus.rejected}
                </p>
                <p className="text-xs text-[#6B5B7B]">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-[#E4D8F0] shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-[#6B5B7B]">
            Recent activity feed coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
