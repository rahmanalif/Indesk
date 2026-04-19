import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, Copy, ExternalLink, FileText, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useGenerateClientPublicTokenMutation, useSendClientIntakeLinkMutation } from '../../redux/api/clientsApi';

interface ClientIntakeLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
  publicToken?: string | null;
}

export function ClientIntakeLinkModal({ isOpen, onClose, clientId, clientName, publicToken }: ClientIntakeLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const [resolvedPublicToken, setResolvedPublicToken] = useState(publicToken || '');
  const [generateClientPublicToken, { isLoading: isGeneratingToken }] = useGenerateClientPublicTokenMutation();
  const [sendClientIntakeLink, { isLoading: isSending }] = useSendClientIntakeLinkMutation();

  useEffect(() => {
    setResolvedPublicToken(publicToken || '');
  }, [publicToken, isOpen]);

  useEffect(() => {
    if (!isOpen || resolvedPublicToken || !clientId) return;

    generateClientPublicToken(clientId)
      .unwrap()
      .then((response) => {
        const token = response?.response?.data?.publicToken || '';
        if (token) setResolvedPublicToken(token);
      })
      .catch(() => {
        setResolvedPublicToken('');
      });
  }, [clientId, generateClientPublicToken, isOpen, resolvedPublicToken]);

  const shareUrl = useMemo(() => {
    if (!resolvedPublicToken) return '';
    return `${window.location.origin}/client-intake-form?publicToken=${encodeURIComponent(resolvedPublicToken)}`;
  }, [resolvedPublicToken]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleSend = async () => {
    if (!clientId) {
      alert('Client id is missing. Please refresh and try again.');
      return;
    }

    try {
      const response = await sendClientIntakeLink(clientId).unwrap();
      alert(response?.message || `Intake link sent to ${clientName || 'the client'}.`);
      onClose();
    } catch (error: any) {
      alert(error?.data?.message || error?.message || 'Failed to send intake link.');
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
                Share this public page with this client so they can complete the intake form before their first appointment.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Public Link</label>
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm break-all text-foreground">
            {isGeneratingToken ? 'Generating public link...' : shareUrl || 'Unable to generate public link.'}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" className="gap-2" onClick={handleCopy} disabled={!shareUrl || isGeneratingToken}>
            {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
          <Button className="gap-2" onClick={handleSend} isLoading={isSending} disabled={!clientId || isGeneratingToken}>
            <Send className="h-4 w-4" />
            Send
          </Button>
          <a href={shareUrl || undefined} target="_blank" rel="noreferrer">
            <Button className="w-full gap-2 sm:w-auto" disabled={!shareUrl || isGeneratingToken || isSending}>
              <ExternalLink className="h-4 w-4" />
              Open Public Form
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
