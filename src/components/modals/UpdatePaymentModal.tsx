import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CreditCard, ExternalLink, Lock } from 'lucide-react';
import { useCreateBillingPortalSessionMutation } from '../../redux/api/clientsApi';

interface UpdatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdatePaymentModal({ isOpen, onClose }: UpdatePaymentModalProps) {
  const [createBillingPortalSession, { isLoading }] = useCreateBillingPortalSessionMutation();

  const handleContinue = async () => {
    try {
      const response = await createBillingPortalSession({
        returnUrl: `${window.location.origin}/subscription`,
      }).unwrap();

      const portalUrl = response.response?.data?.url;
      if (!portalUrl) {
        throw new Error('Billing portal URL was not returned by the server.');
      }

      window.location.assign(portalUrl);
    } catch (error: any) {
      alert(error?.data?.message || error?.message || 'Failed to open billing portal.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => undefined : onClose}
      title="Manage Payment Method"
      description="You will be redirected to Stripe's secure billing portal to update your card details."
    >
      <div className="space-y-5">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm border">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">Update card details securely</p>
              <p className="text-muted-foreground">
                Stripe handles payment method updates, billing details, and saved cards outside the app.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" />
          Your payment details are processed securely by Stripe.
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleContinue} isLoading={isLoading}>
            Continue to Stripe
            {!isLoading && <ExternalLink className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
