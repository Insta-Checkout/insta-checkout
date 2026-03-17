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
  Clock,
  XCircle,
  Globe,
  Instagram,
  Users,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

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
  instapayInfo?: {
    method?: string;
    mobile?: string;
    bankName?: string;
    bankAccountNumber?: string;
    ipaAddress?: string;
  };
  maskedName: string;
  maskedFullName: string;
  createdAt: string;
  logoUrl?: string;
  socialLinks?: { instagram?: string; facebook?: string; whatsapp?: string };
  approvalStatus?: string;
  approvalNote?: string;
  approvedAt?: string;
  rejectedAt?: string;
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

type TeamMember = {
  id: string;
  email: string;
  displayName: string | null;
  roleLabel: string;
  permissions: string[];
  invitedBy: string;
  joinedAt: string;
};

type PendingInvite = {
  id: string;
  email: string;
  roleLabel: string;
  permissions: string[];
  expiresAt: string;
  createdAt: string;
};

type TeamResponse = {
  members: TeamMember[];
  pendingInvites: PendingInvite[];
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

function ApprovalStatusBadge({ status }: { status?: string }): React.JSX.Element {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
        <Clock className="h-4 w-4" /> Pending Review
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
        <XCircle className="h-4 w-4" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
      <CheckCircle className="h-4 w-4" /> Approved
    </span>
  );
}

export default function SellerDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<SellerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [team, setTeam] = useState<TeamResponse | null>(null);

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

  const fetchTeam = useCallback(async (): Promise<void> => {
    if (!user || !id) return;
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/admin/sellers/${id}/team`,
        {},
        () => user.getIdToken()
      );
      if (res.ok) {
        const json = (await res.json()) as TeamResponse;
        setTeam(json);
      }
    } catch {
      // Team data is supplementary — don't block the page
    }
  }, [user, id]);

  useEffect(() => {
    void fetchSeller();
    void fetchTeam();
  }, [fetchSeller, fetchTeam]);

  async function handleApproval(action: "approve" | "reject", note?: string): Promise<void> {
    if (!user || !id) return;
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/admin/sellers/${id}/approval`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, note: note || null }),
        },
        () => user.getIdToken()
      );
      if (!res.ok) {
        throw new Error(`Failed to ${action} seller`);
      }
      toast.success(action === "approve" ? "Seller approved" : "Seller rejected");
      setShowRejectDialog(false);
      setRejectNote("");
      void fetchSeller();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action}`);
    } finally {
      setActionLoading(false);
    }
  }

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

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E0A3C] font-heading">
            {seller.businessName || seller.fullName}
          </h1>
          {seller.businessName && seller.fullName && (
            <p className="mt-1 text-sm text-[#6B5B7B]">{seller.fullName}</p>
          )}
        </div>
        <ApprovalStatusBadge status={seller.approvalStatus} />
      </div>

      {/* Approve/Reject actions for pending sellers */}
      {seller.approvalStatus === "pending" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">
                This seller is waiting for approval
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => void handleApproval("approve")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <CheckCircle className="mr-1 h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(true)}
                disabled={actionLoading}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="mr-1 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection note if rejected */}
      {seller.approvalStatus === "rejected" && seller.approvalNote && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-sm text-red-800">
              <span className="font-medium">Rejection note:</span> {seller.approvalNote}
            </p>
          </CardContent>
        </Card>
      )}

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
            {seller.instapayInfo?.method && (
              <InfoItem
                icon={<DollarSign className="h-4 w-4 text-[#7C3AED]" />}
                label="InstaPay Method"
                value={seller.instapayInfo.method === "mobile"
                  ? `Mobile: ${seller.instapayInfo.mobile || "—"}`
                  : seller.instapayInfo.method === "bank"
                  ? `Bank: ${seller.instapayInfo.bankName || "—"} / ${seller.instapayInfo.bankAccountNumber || "—"}`
                  : `IPA: ${seller.instapayInfo.ipaAddress || "—"}`}
              />
            )}
            {(seller.maskedFullName || seller.maskedName) && (
              <InfoItem
                icon={<Store className="h-4 w-4 text-[#7C3AED]" />}
                label="Masked Name"
                value={seller.maskedFullName || seller.maskedName}
              />
            )}
            {seller.socialLinks?.instagram && (
              <InfoItem
                icon={<Instagram className="h-4 w-4 text-[#7C3AED]" />}
                label="Instagram"
                value={seller.socialLinks.instagram}
              />
            )}
            {seller.socialLinks?.facebook && (
              <InfoItem
                icon={<Globe className="h-4 w-4 text-[#7C3AED]" />}
                label="Facebook"
                value={seller.socialLinks.facebook}
              />
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Team Members */}
      {team && (team.members.length > 0 || team.pendingInvites.length > 0) && (
        <Card className="border-[#E4D8F0] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#1E0A3C]">
              <Users className="h-5 w-5 text-[#7C3AED]" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {team.members.length > 0 && (
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-[#E4D8F0] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE9FE]">
                        <Shield className="h-4 w-4 text-[#7C3AED]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1E0A3C]">
                          {member.displayName || member.email}
                        </p>
                        {member.displayName && (
                          <p className="text-xs text-[#6B5B7B]">{member.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-xs font-medium text-[#7C3AED]">
                        {member.roleLabel}
                      </span>
                      <span className="text-xs text-[#6B5B7B]">
                        Joined {formatDate(member.joinedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {team.pendingInvites.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-[#6B5B7B]">
                  Pending Invitations
                </p>
                {team.pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border border-dashed border-[#E4D8F0] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-50">
                        <Mail className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1E0A3C]">{invite.email}</p>
                        <p className="text-xs text-[#6B5B7B]">
                          Expires {formatDate(invite.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      {invite.roleLabel} (pending)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#6B5B7B]">
              Optionally provide a reason for rejection. The seller will see this message.
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Rejection reason (optional, max 500 characters)"
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-[#E4D8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(false)}
                className="border-[#E4D8F0]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => void handleApproval("reject", rejectNote)}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  "Reject Seller"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
