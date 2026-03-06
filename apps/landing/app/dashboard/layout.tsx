import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "لوحة التحكم | Insta Checkout",
  description: "لوحة تحكم البائعين — إدارة المنتجات ولينكات الدفع",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
