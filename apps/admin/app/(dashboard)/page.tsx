"use client";

import { Users, Link2, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STAT_CARDS = [
  { label: "Total Sellers", icon: Users },
  { label: "Active Links", icon: Link2 },
  { label: "Total Orders", icon: ShoppingCart },
  { label: "Revenue", icon: TrendingUp },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1E0A3C] font-heading">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#6B5B7B]">
          Welcome to the Insta Checkout admin panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, icon: Icon }) => (
          <Card key={label} className="border-[#E4D8F0] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B5B7B]">{label}</CardTitle>
              <div className="w-8 h-8 bg-[#EDE9FE] rounded-full flex items-center justify-center">
                <Icon className="h-4 w-4 text-[#7C3AED]" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#E4D8F0] shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-[#6B5B7B]">
            Analytics and seller management features coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
