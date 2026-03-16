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
};

type SellersResponse = {
  data: Seller[];
  total: number;
  page: number;
  limit: number;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PAGE_SIZE = 20;

export default function SellersPage(): React.JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSellers = useCallback(
    async (p: number, q: string): Promise<void> => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(PAGE_SIZE),
        });
        if (q) params.set("search", q);

        const res = await fetchWithAuth(
          `${getBackendUrl()}/admin/sellers?${params.toString()}`,
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
    void fetchSellers(page, search);
  }, [fetchSellers, page, search]);

  function handleSearchChange(value: string): void {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 300);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E0A3C] font-heading">
          Sellers
        </h1>
        <p className="mt-1 text-sm text-[#6B5B7B]">
          {total} registered seller{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5B7B]" />
        <Input
          placeholder="Search by name, email, or business..."
          className="pl-10 border-[#E4D8F0] focus-visible:ring-[#7C3AED]"
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchSellers(page, search)}
              className="ml-auto border-red-200 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

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
                <th className="px-4 py-3 text-left font-medium text-[#6B5B7B]">
                  WhatsApp
                </th>
                <th className="px-4 py-3 text-center font-medium text-[#6B5B7B]">
                  Verified
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
                      {Array.from({ length: 6 }).map((_, j) => (
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
                      <td className="px-4 py-3 text-[#6B5B7B]">
                        {seller.whatsappNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {seller.whatsappVerified ? (
                          <CheckCircle className="inline h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="inline h-4 w-4 text-[#C4B5D0]" />
                        )}
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
