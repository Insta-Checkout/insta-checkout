"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";

type Seller = {
  _id: string;
  fullName: string;
  businessName: string;
  category: string;
  email: string;
  whatsappNumber: string;
  whatsappVerified: boolean;
  onboardingComplete: boolean;
  createdAt: string;
  logoUrl?: string;
  approvalStatus?: string;
};

type SellersResponse = {
  data: Seller[];
  total: number;
  page: number;
  limit: number;
};

type Tab = "pending" | "all";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ApprovalBadge({ status }: { status?: string }): React.JSX.Element {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
        <XCircle className="h-3 w-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
      <CheckCircle className="h-3 w-3" /> Approved
    </span>
  );
}

const PAGE_SIZE = 20;

export default function SellersPage(): React.JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPendingCount = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/admin/sellers/pending/count`,
        {},
        () => user.getIdToken()
      );
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.count ?? 0);
      }
    } catch {
      // Non-critical
    }
  }, [user]);

  const fetchSellers = useCallback(
    async (p: number, q: string, currentTab: Tab): Promise<void> => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const endpoint =
          currentTab === "pending"
            ? `${getBackendUrl()}/admin/sellers/pending`
            : `${getBackendUrl()}/admin/sellers`;

        const params = new URLSearchParams({
          page: String(p),
          limit: String(PAGE_SIZE),
        });
        if (q && currentTab === "all") params.set("search", q);

        const res = await fetchWithAuth(
          `${endpoint}?${params.toString()}`,
          {},
          () => user.getIdToken()
        );
        if (!res.ok) {
          throw new Error(
            res.status === 403
              ? "Access denied"
              : `Failed to load sellers (${res.status})`
          );
        }
        const data = (await res.json()) as SellersResponse;
        setSellers(data.data);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sellers");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    void fetchPendingCount();
  }, [fetchPendingCount]);

  useEffect(() => {
    void fetchSellers(page, search, tab);
  }, [fetchSellers, page, search, tab]);

  function handleSearchChange(value: string): void {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 300);
  }

  function handleTabChange(newTab: Tab): void {
    setTab(newTab);
    setPage(1);
    setSearch("");
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E0A3C] font-heading">
          Sellers
        </h1>
        <p className="mt-1 text-sm text-[#6B5B7B]">
          {total} {tab === "pending" ? "pending" : "registered"} seller{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E4D8F0]">
        <button
          onClick={() => handleTabChange("pending")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === "pending"
              ? "border-[#7C3AED] text-[#7C3AED]"
              : "border-transparent text-[#6B5B7B] hover:text-[#1E0A3C]"
          }`}
        >
          Pending Review
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === "all"
              ? "border-[#7C3AED] text-[#7C3AED]"
              : "border-transparent text-[#6B5B7B] hover:text-[#1E0A3C]"
          }`}
        >
          All Sellers
        </button>
      </div>

      {/* Search — only on All tab */}
      {tab === "all" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5B7B]" />
          <Input
            placeholder="Search by name, email, or business..."
            className="pl-10 border-[#E4D8F0] focus-visible:ring-[#7C3AED]"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchSellers(page, search, tab)}
              className="ml-auto border-red-200 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending tab: card list */}
      {tab === "pending" ? (
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-[#E4D8F0]">
                  <CardContent className="py-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            : sellers.map((seller) => (
                <Card
                  key={seller._id}
                  className="border-[#E4D8F0] hover:border-[#7C3AED]/30 cursor-pointer transition-colors"
                  onClick={() => router.push(`/sellers/${seller._id}`)}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-[#1E0A3C]">
                        {seller.businessName || seller.fullName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#6B5B7B]">
                        <span>{seller.email}</span>
                        <span>{seller.category || "—"}</span>
                        <span>{seller.createdAt ? formatDate(seller.createdAt) : "—"}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3EEFA]"
                    >
                      Review
                    </Button>
                  </CardContent>
                </Card>
              ))}

          {!loading && sellers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#1E0A3C]">
                No pending sellers
              </h3>
              <p className="max-w-sm text-sm text-[#6B5B7B]">
                All sellers have been reviewed. New signups will appear here.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* All tab: table */
        <Card className="border-[#E4D8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4D8F0] bg-[#FAFAFA]">
                  <th className="px-4 py-3 text-left font-medium text-[#6B5B7B]">
                    Business Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B5B7B]">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B5B7B]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-[#6B5B7B]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B5B7B]">
                    Signed Up
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-[#E4D8F0]">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-5 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sellers.map((seller) => (
                      <tr
                        key={seller._id}
                        className="border-b border-[#E4D8F0] hover:bg-[#F5F3FF] cursor-pointer transition-colors"
                        onClick={() => router.push(`/sellers/${seller._id}`)}
                      >
                        <td className="px-4 py-3 font-medium text-[#1E0A3C]">
                          {seller.businessName || seller.fullName}
                        </td>
                        <td className="px-4 py-3 text-[#6B5B7B]">
                          {seller.category || "—"}
                        </td>
                        <td className="px-4 py-3 text-[#6B5B7B]">
                          {seller.email}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ApprovalBadge status={seller.approvalStatus} />
                        </td>
                        <td className="px-4 py-3 text-[#6B5B7B]">
                          {seller.createdAt ? formatDate(seller.createdAt) : "—"}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {!loading && sellers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-[#EDE9FE] p-4">
                <Users className="h-8 w-8 text-[#7C3AED]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#1E0A3C]">
                No sellers found
              </h3>
              <p className="max-w-sm text-sm text-[#6B5B7B]">
                {search
                  ? "Try adjusting your search terms."
                  : "No sellers have registered yet."}
              </p>
            </div>
          )}
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6B5B7B]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-[#E4D8F0]"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-[#E4D8F0]"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
