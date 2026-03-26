import { useState } from 'react';
import { CheckCheck, Copy, ExternalLink, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ClientIntakeLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientIntakeLinkModal({ isOpen, onClose }: ClientIntakeLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/client-intake-form`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Public Intake Form">
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-white p-2 shadow-sm">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Client Intake Form Link</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Share this public page with any client so they can complete the intake form before their first appointment.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Public Link</label>
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm break-all text-foreground">
            {shareUrl}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" className="gap-2" onClick={handleCopy}>
            {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
          <a href={shareUrl} target="_blank" rel="noreferrer">
            <Button className="w-full gap-2 sm:w-auto">
              <ExternalLink className="h-4 w-4" />
              Open Public Form
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
