import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface IntegrationPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function IntegrationPermissionsModal({
  isOpen,
  onClose,
  integrationName,
  onConfirm,
  isLoading = false,
}: IntegrationPermissionsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Disconnect ${integrationName}`} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to disconnect <span className="font-medium text-foreground">{integrationName}</span>?
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} isLoading={isLoading}>
            Disconnect
          </Button>
        </div>
      </div>
    </Modal>
  );
}
