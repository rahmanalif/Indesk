import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { AlertCircle } from 'lucide-react';
interface IntegrationPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationName: string;
  mode?: 'connect' | 'disconnect';
}
export function IntegrationPermissionsModal({
  isOpen,
  onClose,
  integrationName,
  mode = 'connect',
}: IntegrationPermissionsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isDisconnectMode = mode === 'disconnect';
  const handlePrimaryAction = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1500);
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={isDisconnectMode ? `Disconnect ${integrationName}` : `Connect ${integrationName}`} description={isDisconnectMode ? 'Manage integration access' : 'Configure permissions'}>
      <div className="space-y-6">
        <div className={`${isDisconnectMode ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-blue-50 border-blue-100 text-blue-800'} border rounded-lg p-4 flex gap-3 text-sm`}>
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            {isDisconnectMode
              ? `Disconnect support for ${integrationName} is not wired yet in this build. The button is shown so the UI reflects the correct connected state.`
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

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onClose}>
            {isDisconnectMode ? 'Close' : 'Cancel'}
          </Button>
          <Button onClick={handlePrimaryAction} isLoading={isLoading}>
            {isDisconnectMode ? 'Understood' : 'Authorize & Connect'}
          </Button>
        </div>
      </div>
    </Modal>;
}
