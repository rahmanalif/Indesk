import { CreditCard } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

type SubscriptionUpdateWarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onUpgrade: () => void;
  planName: string;
  clinicianCount: number;
  includedClinicians?: number | null;
  clinicianBlockedByPlan: boolean;
  clinicianBillable: boolean;
  selectedSeatBlocked: boolean;
  nextClinicianTierPrice?: number | null;
  priceLabel?: string | null;
  summaryTitle: string;
  summaryDescription: string;
};

export function SubscriptionUpdateWarningModal({
  isOpen,
  onClose,
  onContinue,
  onUpgrade,
  planName,
  clinicianCount,
  includedClinicians,
  clinicianBlockedByPlan,
  clinicianBillable,
  selectedSeatBlocked,
  nextClinicianTierPrice,
  priceLabel,
  summaryTitle,
  summaryDescription,
}: SubscriptionUpdateWarningModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subscription Update Warning"
      description="Adding a clinician or admin can affect your subscription billing."
    >
      <div className="space-y-5">
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            selectedSeatBlocked
              ? "border-red-200 bg-red-50 text-red-900"
              : clinicianBillable
                ? "border-amber-200 bg-amber-50 text-amber-950"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          <div className="flex gap-3">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{summaryTitle}</p>
              <p
                className={`text-xs ${
                  selectedSeatBlocked
                    ? "text-red-800"
                    : clinicianBillable
                      ? "text-amber-900"
                      : "text-emerald-800"
                }`}
              >
                {summaryDescription}
              </p>
            </div>
          </div>
        </div>

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
                <span className="font-semibold">{clinicianCount}</span>
                {typeof includedClinicians === "number" ? (
                  <span className="text-muted-foreground">
                    {" "}
                    / {includedClinicians} included
                  </span>
                ) : null}
              </p>
            </div>
            {typeof nextClinicianTierPrice === "number" && clinicianBillable ? (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                +{priceLabel}
              </span>
            ) : null}
          </div>
          {clinicianBillable ? (
            <p className="mt-2 text-xs text-amber-900">
              Money will get deducted from you added account.
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {selectedSeatBlocked ? (
            <Button type="button" onClick={onUpgrade}>
              Upgrade Plan
            </Button>
          ) : (
            <Button type="button" onClick={onContinue}>
              {priceLabel
                ? `Continue • +${priceLabel} will be added`
                : "Continue"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
