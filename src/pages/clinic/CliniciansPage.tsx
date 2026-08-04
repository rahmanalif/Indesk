import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  CreditCard,
  Plus,
  Search,
  Mail,
  MoreHorizontal,
  UserCheck,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import {
  useDeleteClinicMemberMutation,
  useGetAvailablePlansQuery,
  useGetClinicMembersQuery,
  useGetCurrentSubscriptionQuery,
} from "../../redux/api/clientsApi";
import { CreateClinicianModal } from "../../components/modals/CreateClinicianModal";
import { ClinicianScheduleModal } from "../../components/modals/ClinicianScheduleModal";
import { RootState } from "../../store";
import { normalizeAvailabilitySchedule } from "../../lib/clinicianAvailability";

function formatMemberRole(role?: string) {
  const normalized = (role || "").toLowerCase();
  if (normalized === "superadmin") return "Super Admin";
  if (normalized === "admin") return "Admin";
  if (normalized === "clinician") return "Clinician";
  if (!role) return "Clinician";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function CliniciansPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSeatWarningOpen, setIsSeatWarningOpen] = useState(false);
  const [pendingSeatType, setPendingSeatType] = useState<"clinician" | "admin">(
    "clinician",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClinician, setSelectedClinician] = useState<any>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const goToDetails = (clinicianId: string) => {
    navigate(`/clinic/team/${clinicianId}/details`);
  };

  // Custom Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    data: clinicMembersResponse,
    isLoading: clinicLoading,
    isError: clinicError,
  } = useGetClinicMembersQuery({ page: 1, limit: 50 });
  const { data: subscriptionResponse } = useGetCurrentSubscriptionQuery();
  const { data: plansResponse } = useGetAvailablePlansQuery();
  const [deleteClinicMember, { isLoading: isDeletingClinicMember }] =
    useDeleteClinicMemberMutation();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const clinicMembers = clinicMembersResponse?.response?.data?.docs || [];
  const subscriptionUsage = subscriptionResponse?.response?.data?.usage;
  const planName =
    subscriptionUsage?.plan?.name ||
    subscriptionUsage?.planName ||
    "your current plan";
  const includedClinicians =
    subscriptionUsage?.plan?.seatPolicy?.includedClinicians;
  const includedAdminUsers =
    subscriptionUsage?.plan?.seatPolicy?.includedAdminUsers;
  const clinicianCount = subscriptionUsage?.clinicians?.currentCount ?? 0;
  const adminUserCount = subscriptionUsage?.adminUsers?.currentCount ?? 0;
  const clinicianLimit = subscriptionUsage?.clinicians?.limit;
  const adminUserLimit = subscriptionUsage?.adminUsers?.limit;
  const formatBillingAmount = (value?: number | null, currency = "GBP") => {
    if (typeof value !== "number") {
      return null;
    }
    const symbol =
      currency.toUpperCase() === "GBP" ? "£" : `${currency.toUpperCase()} `;
    return `${symbol}${value.toFixed(Number.isInteger(value) ? 0 : 2)}`;
  };
  const currentSubscription =
    subscriptionResponse?.response?.data?.subscription;
  const availablePlans = plansResponse?.response?.data || [];
  const currentPlanFromAvailable = availablePlans.find(
    (plan) =>
      plan.id === currentSubscription?.planId ||
      plan.id === currentSubscription?.plan?.id ||
      plan.name?.toLowerCase() === planName.toLowerCase(),
  );
  const displayPlan =
    currentPlanFromAvailable ||
    currentSubscription?.plan ||
    subscriptionUsage?.plan;
  const displaySeatPolicy =
    displayPlan &&
    typeof displayPlan === "object" &&
    "seatPolicy" in displayPlan
      ? (displayPlan as any).seatPolicy
      : subscriptionUsage?.plan?.seatPolicy;
  const displayPlanName = displayPlan?.name || planName;
  const displayIncludedClinicians =
    displaySeatPolicy?.includedClinicians ??
    subscriptionUsage?.clinicians?.included ??
    includedClinicians;
  const displayIncludedAdmins =
    displaySeatPolicy?.includedAdminUsers ??
    subscriptionUsage?.adminUsers?.included ??
    includedAdminUsers;
  const displayClinicianCount =
    subscriptionUsage?.clinicians?.currentCount ?? clinicianCount;
  const displayAdminCount =
    subscriptionUsage?.adminUsers?.currentCount ??
    subscriptionUsage?.adminUsers?.billableCount ??
    adminUserCount;
  const displayClinicianLimit =
    subscriptionUsage?.clinicians?.limit ??
    (displayPlan as any)?.clinicianLimit ??
    clinicianLimit;
  const displayAdminLimit =
    subscriptionUsage?.adminUsers?.limit ??
    (displayPlan as any)?.adminUserLimit ??
    adminUserLimit;
  const displayExtraCliniciansAllowed = Boolean(
    subscriptionUsage?.clinicians?.canAddClinician ||
    subscriptionUsage?.clinicians?.extraCliniciansAllowed ||
    displaySeatPolicy?.extraCliniciansAllowed ||
    displaySeatPolicy?.canAddExtraClinicians,
  );
  const displayExtraAdminsAllowed = Boolean(
    subscriptionUsage?.adminUsers?.canAddAdminUser ||
    subscriptionUsage?.adminUsers?.extraAdminsAllowed ||
    (displaySeatPolicy as any)?.extraAdminsAllowed,
  );
  const displayCanAddAdmin =
    subscriptionUsage?.adminUsers?.canAddAdminUser ??
    (typeof displayAdminLimit === "number" && displayAdminLimit > 0
      ? displayAdminCount < displayAdminLimit
      : true);

  // Pricing source: subscription.plan.extraSeatsConfig (real tiered prices live here)
  const planSeatsConfig =
    (currentSubscription?.plan as any)?.extraSeatsConfig ||
    (currentPlanFromAvailable as any)?.extraSeatsConfig ||
    null;
  const planCurrencyRaw =
    (currentSubscription?.plan as any)?.currency ||
    (currentPlanFromAvailable as any)?.currency ||
    "GBP";
  const findSeatTypeConfig = (type: "clinician" | "admin") =>
    planSeatsConfig?.types?.find((t: any) => t?.type === type) || null;
  const computeNextSeatTier = (
    type: "clinician" | "admin",
    currentCount: number,
    included: number,
  ) => {
    const cfg = findSeatTypeConfig(type);
    if (!cfg || !Array.isArray(cfg.tiers) || cfg.tiers.length === 0)
      return null;
    const nextExtra = Math.max(0, currentCount - (included ?? 0)) + 1;
    if (typeof cfg.max === "number" && cfg.max > 0 && nextExtra > cfg.max) {
      return {
        price: null as number | null,
        upTo: null,
        max: cfg.max,
        capped: true,
      };
    }
    const tier = cfg.tiers.find(
      (t: any) => t?.upTo == null || nextExtra <= Number(t.upTo),
    );
    return tier
      ? {
          price: tier.pricePerSeat as number,
          upTo: tier.upTo ?? null,
          max: cfg.max ?? null,
          capped: false,
        }
      : null;
  };
  const addingClinician = pendingSeatType === "clinician";
  const addingAdmin = pendingSeatType === "admin";
  const clinicianWithinIncluded =
    typeof displayIncludedClinicians === "number"
      ? displayClinicianCount < displayIncludedClinicians
      : true;
  const adminWithinIncluded =
    typeof displayIncludedAdmins === "number"
      ? displayAdminCount < displayIncludedAdmins
      : true;
  const clinicianAtLimit =
    typeof displayClinicianLimit === "number" &&
    displayClinicianLimit > 0 &&
    displayClinicianCount >= displayClinicianLimit;
  const clinicianBlockedByPlan =
    addingClinician && clinicianAtLimit && !displayExtraCliniciansAllowed;
  const clinicianBillable =
    addingClinician &&
    !clinicianWithinIncluded &&
    displayExtraCliniciansAllowed;
  const adminBlockedByPlan =
    addingAdmin && !displayCanAddAdmin && !displayExtraAdminsAllowed;
  const adminBillable =
    addingAdmin && !adminWithinIncluded && displayExtraAdminsAllowed;
  const nextClinicianTier = computeNextSeatTier(
    "clinician",
    displayClinicianCount,
    displayIncludedClinicians ?? 0,
  );
  const nextAdminTier = computeNextSeatTier(
    "admin",
    displayAdminCount,
    displayIncludedAdmins ?? 0,
  );
  const nextSeatTier = addingClinician ? nextClinicianTier : nextAdminTier;
  const isSelfPlan = displayPlanName.toLowerCase() === "self";
  const selectedSeatBlocked =
    clinicianBlockedByPlan ||
    adminBlockedByPlan ||
    (addingClinician && nextClinicianTier?.capped) ||
    (addingAdmin && nextAdminTier?.capped);
  const selectedSeatBillable = clinicianBillable || adminBillable;
  const modalSummaryTitle = addingClinician
    ? clinicianBlockedByPlan
      ? `You cannot add another clinician on ${displayPlanName}.`
      : nextClinicianTier?.capped
        ? `You have reached the maximum of ${nextClinicianTier.max} extra clinicians on ${displayPlanName}.`
        : clinicianBillable
          ? "Adding another clinician will increase your subscription cost."
          : "This clinician is included in your current plan."
    : adminBlockedByPlan
      ? isSelfPlan
        ? `You cannot add an admin on ${displayPlanName}.`
        : `You have reached the admin limit on ${displayPlanName}.`
      : nextAdminTier?.capped
        ? `You have reached the maximum of ${nextAdminTier.max} extra admins on ${displayPlanName}.`
        : adminBillable
          ? "Adding another admin will increase your subscription cost."
          : "This admin is included in your current plan.";
  const modalSummaryDescription = addingClinician
    ? clinicianBlockedByPlan
      ? `${displayPlanName} includes ${displayIncludedClinicians ?? "limited"} clinician${displayIncludedClinicians === 1 ? "" : "s"} and does not support extra clinician billing. Upgrade your plan to add another clinician.`
      : clinicianBillable
        ? "Extra clinician billing is enabled for this plan. Review the pricing before continuing."
        : "No extra clinician charge is expected for this team member."
    : adminBlockedByPlan
      ? isSelfPlan
        ? `${displayPlanName} includes ${displayIncludedAdmins ?? 0} admin users. Upgrade your plan to add admin access.`
        : `${displayPlanName} includes ${displayIncludedAdmins ?? "limited"} admin user${displayIncludedAdmins === 1 ? "" : "s"}. To add more admins, a plan change may be required.`
      : adminBillable
        ? "Extra admin billing is enabled for this plan. Review the pricing before continuing."
        : "No extra admin charge is expected for this team member.";
  const continueChargeAmount =
    (clinicianBillable || adminBillable) &&
    typeof nextSeatTier?.price === "number"
      ? formatBillingAmount(nextSeatTier.price, planCurrencyRaw)
      : null;
  const continueChargeLabel = continueChargeAmount
    ? `${continueChargeAmount}/month`
    : null;
  const apiOrigin = (() => {
    try {
      return new URL(import.meta.env.VITE_API_BASE_URL).origin;
    } catch {
      return "";
    }
  })();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewProfile = (clinician: any) => {
    setOpenDropdownId(null);
    goToDetails(clinician.id);
  };

  const handleEdit = (clinician: any) => {
    setOpenDropdownId(null);
    goToDetails(clinician.id);
  };

  const handleViewSchedule = (clinician: any) => {
    setSelectedClinician(clinician);
    setIsScheduleModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleRemoveClinician = async (clinician: any) => {
    setOpenDropdownId(null);
    const confirmed = window.confirm(
      `Remove ${clinician.name} from this clinic?`,
    );
    if (!confirmed) return;

    try {
      await deleteClinicMember(clinician.id).unwrap();
    } catch (error: any) {
      window.alert(
        error?.data?.message ||
          error?.message ||
          "Failed to remove team member.",
      );
    }
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const openCreateClinicianFlow = () => {
    setPendingSeatType("clinician");
    const hasFreeClinicianSeat =
      typeof displayIncludedClinicians === "number"
        ? displayClinicianCount < displayIncludedClinicians
        : true;
    if (hasFreeClinicianSeat) {
      setIsCreateModalOpen(true);
    } else {
      setIsSeatWarningOpen(true);
    }
  };

  const formattedMembers = clinicMembers.map((member: any) => {
    const firstName = member.user?.firstName || "";
    const lastName = member.user?.lastName || "";
    const name =
      `${firstName} ${lastName}`.trim() || member.user?.email || "Unknown";
    const specialty =
      Array.isArray(member.specialization) && member.specialization.length > 0
        ? member.specialization.join(", ")
        : formatMemberRole(member.role);
    const avatarPath = member.user?.avatar || "";
    const avatar = avatarPath
      ? avatarPath.startsWith("http")
        ? avatarPath
        : avatarPath.startsWith("/uploads/")
          ? `${apiOrigin}/public${avatarPath}`
          : `${apiOrigin}${avatarPath}`
      : undefined;
    const phone =
      `${member.user?.countryCode || ""}${member.user?.phoneNumber || ""}`.trim();
    const isCurrentUser =
      member.userId === currentUserId || member.user?.id === currentUserId;
    const isOnline = isCurrentUser || Boolean(member.user?.isOnline);

    return {
      id: member.id as string,
      name,
      role: formatMemberRole(member.role),
      email: member.user?.email || "",
      avatar,
      phoneNumber: phone,
      bio: member.user?.bio || "",
      availabilitySchedule: normalizeAvailabilitySchedule(member.availabilitySchedule),
      specialization: Array.isArray(member.specialization)
        ? member.specialization
        : [],
      status: isOnline ? "Available" : "Offline",
      specialty,
      clients: member._count?.assignedClients ?? "-",
      sessions: member._count?.appointments ?? "-",
    };
  });

  const filteredClinicians = formattedMembers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Deep-link: open a clinician's profile when arriving with ?clinicianId=...
  const deepLinkClinicianId = searchParams.get("clinicianId");
  const handledDeepLinkRef = useRef<string | null>(null);
  useEffect(() => {
    if (!deepLinkClinicianId) {
      handledDeepLinkRef.current = null;
      return;
    }
    if (handledDeepLinkRef.current === deepLinkClinicianId) return;
    if (clinicMembers.length === 0) return; // wait for data to load
    const match = formattedMembers.find((c) => c.id === deepLinkClinicianId);
    handledDeepLinkRef.current = deepLinkClinicianId;
    if (match) {
      goToDetails(match.id);
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("clinicianId");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLinkClinicianId, clinicMembers.length]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openCreateClinicianFlow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Clinicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clinicLoading && (
          <div className="text-sm text-muted-foreground">
            Loading team members...
          </div>
        )}
        {clinicError && (
          <div className="text-sm text-destructive">
            Failed to load team members.
          </div>
        )}
        {!clinicLoading && !clinicError && filteredClinicians.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No team members found.
          </div>
        )}
        {filteredClinicians.map((clinician) => (
          <Card
            key={clinician.id}
            className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden relative"
          >
            <div className="absolute top-4 right-4 z-20">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 bg-white/80 backdrop-blur-sm border shadow-sm transition-opacity duration-200 ${openDropdownId === clinician.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                onClick={(e) => toggleDropdown(e, clinician.id)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {openDropdownId === clinician.id && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border py-1 animate-in fade-in zoom-in-95 duration-200 z-50"
                >
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    onClick={() => handleEdit(clinician)}
                  >
                    Edit Details
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    onClick={() => handleViewSchedule(clinician)}
                  >
                    View Schedule
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleRemoveClinician(clinician)}
                    disabled={isDeletingClinicMember}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar
                    src={clinician.avatar}
                    fallback={clinician.name[0]}
                    className="h-24 w-24 text-2xl border-4 border-white shadow-sm bg-primary/10 text-primary"
                  >
                    {clinician.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </Avatar>
                </div>

                <h3 className="font-bold text-lg text-foreground">
                  {clinician.name}
                </h3>
                <p className="text-sm font-medium text-primary mb-3">
                  {clinician.role}
                </p>
                <div className="flex gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="text-xs font-normal text-muted-foreground"
                  >
                    {clinician.specialty}
                  </Badge>
                </div>

                <div className="w-full space-y-3 pt-4 border-t border-border/50 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </span>
                    <span className="text-foreground max-w-[120px] truncate">
                      {clinician.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" /> Active Clients
                    </span>
                    <span className="text-foreground font-medium">
                      {clinician.clients}
                    </span>
                  </div>
                </div>

                <div className="mt-6 w-full flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => handleViewProfile(clinician)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isSeatWarningOpen}
        onClose={() => setIsSeatWarningOpen(false)}
        title="Subscription Update Warning"
        description="Adding a clinician or admin can affect your subscription billing."
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setPendingSeatType("clinician")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${addingClinician ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Clinician
            </button>
            <button
              type="button"
              onClick={() => setPendingSeatType("admin")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${addingAdmin ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Admin
            </button>
          </div>

          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              selectedSeatBlocked
                ? "border-red-200 bg-red-50 text-red-900"
                : selectedSeatBillable
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
            }`}
          >
            <div className="flex gap-3">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">{modalSummaryTitle}</p>
                <p
                  className={`text-xs ${selectedSeatBlocked ? "text-red-800" : selectedSeatBillable ? "text-amber-900" : "text-emerald-800"}`}
                >
                  {modalSummaryDescription}
                </p>
              </div>
            </div>
          </div>

          {addingClinician ? (
            <div
              className={`rounded-xl border px-4 py-3 ${
                clinicianBlockedByPlan
                  ? "border-red-200 bg-red-50"
                  : clinicianBillable
                    ? "border-amber-200 bg-amber-50"
                    : "border-border/70 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Clinicians
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    <span className="font-semibold">
                      {displayClinicianCount}
                    </span>
                    {typeof displayIncludedClinicians === "number" ? (
                      <span className="text-muted-foreground">
                        {" "}
                        / {displayIncludedClinicians} included
                      </span>
                    ) : null}
                  </p>
                </div>
                {typeof nextClinicianTier?.price === "number" &&
                clinicianBillable ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                    +
                    {formatBillingAmount(
                      nextClinicianTier.price,
                      planCurrencyRaw,
                    )}
                    /mo
                  </span>
                ) : null}
              </div>
              {clinicianBillable ? (
                <p className="mt-2 text-xs text-amber-900">
                  Money will get deducted from you added account.
                </p>
              ) : null}
            </div>
          ) : (
            <div
              className={`rounded-xl border px-4 py-3 ${
                adminBlockedByPlan
                  ? "border-red-200 bg-red-50"
                  : adminBillable
                    ? "border-amber-200 bg-amber-50"
                    : "border-border/70 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Admins
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    <span className="font-semibold">{displayAdminCount}</span>
                    {typeof displayIncludedAdmins === "number" ? (
                      <span className="text-muted-foreground">
                        {" "}
                        / {displayIncludedAdmins} included
                      </span>
                    ) : null}
                  </p>
                </div>
                {typeof nextAdminTier?.price === "number" && adminBillable ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                    +{formatBillingAmount(nextAdminTier.price, planCurrencyRaw)}
                    /mo
                  </span>
                ) : null}
              </div>
              {adminBillable ? (
                <p className="mt-2 text-xs text-amber-900">
                  Money will get deducted from you added account.
                </p>
              ) : null}
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSeatWarningOpen(false)}
            >
              Close
            </Button>
            {selectedSeatBlocked ? (
              <Button
                type="button"
                onClick={() => {
                  setIsSeatWarningOpen(false);
                  navigate("/subscription");
                }}
              >
                Upgrade Plan
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setIsSeatWarningOpen(false);
                  setIsCreateModalOpen(true);
                }}
              >
                {continueChargeLabel
                  ? `Continue • +${continueChargeLabel} will be added`
                  : "Continue"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
      <CreateClinicianModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialRole={pendingSeatType}
      />
      <ClinicianScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        clinician={selectedClinician}
      />
    </div>
  );
}
