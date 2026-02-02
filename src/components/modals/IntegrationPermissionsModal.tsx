import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { AlertCircle } from 'lucide-react';
interface IntegrationPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationName: string;
}
export function IntegrationPermissionsModal({
  isOpen,
  onClose,
  integrationName
}: IntegrationPermissionsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1500);
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={`Connect ${integrationName}`} description="Configure permissions">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            Connecting this integration will allow Inkind Suite to access data
            from your {integrationName} account.
          </p>
        </div>

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

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConnect} isLoading={isLoading}>
            Authorize & Connect
          </Button>
        </div>
      </div>
    </Modal>;
}