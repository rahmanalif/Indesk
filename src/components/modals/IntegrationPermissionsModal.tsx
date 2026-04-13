import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { AlertCircle } from 'lucide-react';

type HealthTone = 'default' | 'success' | 'error';

interface IntegrationPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationName: string;
  mode?: 'connect' | 'disconnect';
  onPrimaryAction?: () => void | Promise<void>;
  primaryLabel?: string;
  isPrimaryLoading?: boolean;
  onCheckHealth?: () => void | Promise<void>;
  isCheckingHealth?: boolean;
  healthSummary?: string | null;
  healthDetails?: string | null;
  healthTone?: HealthTone;
  feedbackMessage?: string | null;
  feedbackTone?: 'success' | 'error';
}
export function IntegrationPermissionsModal({
  isOpen,
  onClose,
  integrationName,
  mode = 'connect',
  onPrimaryAction,
  primaryLabel,
  isPrimaryLoading = false,
  onCheckHealth,
  isCheckingHealth = false,
  healthSummary,
  healthDetails,
  healthTone = 'default',
  feedbackMessage,
  feedbackTone = 'success',
}: IntegrationPermissionsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isDisconnectMode = mode === 'disconnect';

  const handlePrimaryAction = async () => {
    if (!onPrimaryAction) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1500);
      return;
    }

    await onPrimaryAction();
  };

  const healthToneClassName =
    healthTone === 'success'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
      : healthTone === 'error'
        ? 'border-red-100 bg-red-50 text-red-700'
        : 'border-border/60 bg-muted/40 text-foreground';

  const feedbackToneClassName =
    feedbackTone === 'error'
      ? 'border-red-100 bg-red-50 text-red-700'
      : 'border-emerald-100 bg-emerald-50 text-emerald-800';

  return <Modal isOpen={isOpen} onClose={onClose} title={isDisconnectMode ? `Disconnect ${integrationName}` : `Connect ${integrationName}`} description={isDisconnectMode ? 'Manage integration access' : 'Configure permissions'}>
      <div className="space-y-6">
        <div className={`${isDisconnectMode ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-blue-50 border-blue-100 text-blue-800'} border rounded-lg p-4 flex gap-3 text-sm`}>
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            {isDisconnectMode
              ? `Disconnecting ${integrationName} will remove this account connection from Inkind Suite until you authorize it again.`
              : `Connecting this integration will allow Inkind Suite to access data from your ${integrationName} account.`}
          </p>
        </div>

        {!isDisconnectMode && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Permissions Required:</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Read calendar events</span>
                <Switch defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Create new events</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sync contacts</span>
                <Switch />
              </div>
            </div>
          </div>
        )}

        {isDisconnectMode && onCheckHealth && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-medium">Connection health</h4>
                <p className="text-sm text-muted-foreground">
                  Run a live check before disconnecting if you want to confirm the current status.
                </p>
              </div>
              <Button variant="outline" onClick={onCheckHealth} isLoading={isCheckingHealth}>
                Check Health
              </Button>
            </div>

            {healthSummary && (
              <div className={`rounded-lg border p-4 text-sm ${healthToneClassName}`}>
                <p className="font-medium">{healthSummary}</p>
                {healthDetails && <p className="mt-1 opacity-90">{healthDetails}</p>}
              </div>
            )}
          </div>
        )}

        {feedbackMessage && (
          <div className={`rounded-lg border p-4 text-sm ${feedbackToneClassName}`}>
            {feedbackMessage}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onClose}>
            {isDisconnectMode ? 'Close' : 'Cancel'}
          </Button>
          <Button onClick={handlePrimaryAction} isLoading={onPrimaryAction ? isPrimaryLoading : isLoading} variant={isDisconnectMode ? 'destructive' : 'default'}>
            {primaryLabel || (isDisconnectMode ? 'Disconnect' : 'Authorize & Connect')}
          </Button>
        </div>
      </div>
    </Modal>;
}
