import { AuthProvider } from "@/lib/auth/AuthProvider";
import { AdminShell } from "@/components/admin/AdminShell";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={200}>
        <AdminShell>{children}</AdminShell>
      </TooltipProvider>
    </AuthProvider>
  );
}
