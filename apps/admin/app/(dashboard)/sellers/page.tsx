"use client";

import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1E0A3C] font-heading">Sellers</h1>
      <Card className="border-[#E4D8F0] shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-[#EDE9FE] p-4">
            <Users className="h-8 w-8 text-[#7C3AED]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-[#1E0A3C]">
            Seller Management
          </h3>
          <p className="max-w-sm text-sm text-[#6B5B7B]">
            View, approve, and manage registered sellers. Coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
