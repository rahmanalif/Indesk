import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone, Shield, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { useGetClinicQuery } from '../../redux/api/clientsApi';
import { useEnhanceEmailMutation, useSendEmailMutation } from '../../redux/api/aiAssistantApi';

type ClientOutletContext = {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'Active' | 'Waiting List' | 'Inactive';
  };
  clientRaw: any;
};

export function ClientLettersPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { client, clientRaw } = useOutletContext<ClientOutletContext>();
  const { data: clinicResponse, isLoading: clinicLoading } = useGetClinicQuery();
  const clinic = clinicResponse?.response?.data;
  const [recipientEmail, setRecipientEmail] = useState(client?.email || '');
  const [subject, setSubject] = useState(`Letter for ${client?.name || 'Client'}`);
  const [documentTitle, setDocumentTitle] = useState('Untitled Letter');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [enhanceEmail, { isLoading: isEnhancing }] = useEnhanceEmailMutation();
  const [sendEmail, { isLoading: isSending }] = useSendEmailMutation();
  const OPENING_LINE = 'To Whom it may concern,';
  const CLOSING_LINE = 'Please do not hesitate to contact me further with any questions,';

  const letterDate = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  }, []);

  const fullAddress = useMemo(() => {
    const address = clientRaw?.address;
    const parts = [address?.street, address?.city, address?.state, address?.zip, address?.country]
      .map((part: string) => (part || '').trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  }, [clientRaw]);

  const apiOrigin = useMemo(() => {
    try {
      return new URL(import.meta.env.VITE_CLIENTS_API_BASE_URL).origin;
    } catch {
      return '';
    }
  }, []);

  const resolveImageUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    if (!apiOrigin) return value;
    if (value.startsWith('/uploads/')) return `${apiOrigin}/public${value}`;
    return `${apiOrigin}${value}`;
  };

  const normalizeAddress = (address: any) => {
    if (!address) return {};
    if (typeof address === 'string') {
      try {
        return JSON.parse(address);
      } catch {
        return {};
      }
    }
    if (typeof address === 'object') return address;
    return {};
  };

  const escapeHtml = (value?: string | null) =>
    (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const clinicAddress = normalizeAddress(clinic?.address);
  const clinicAddressLine = [clinicAddress.street, clinicAddress.city, clinicAddress.state, clinicAddress.zip, clinicAddress.country]
    .map((part: string) => (part || '').trim())
    .filter(Boolean)
    .join(', ');
  const clinicLogo = resolveImageUrl(clinic?.logo) || '/images/inkind logo-04.png';
  const clinicName = clinic?.name || 'UK INKIND PSYCHOLOGY';
  const clinicEmail = clinic?.email || 'support@inkind.uk';
  const clinicWebsite = clinic?.url || 'www.inkind.uk';
  const clinicPhone = `${clinic?.countryCode || ''}${clinic?.phoneNumber || ''}`.trim() || '08000318141';

  const initialTemplateHtml = useMemo(() => {
    const authorizationCode = clientRaw?.insuranceAuthorizationNumber || '-';
    const customerNumber = clientRaw?.insuranceNumber || '-';
    const reLine = client?.name || '-';

    return `
      <div style="border-bottom:1px solid #d4cec6;padding-bottom:14px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:18px;">
          <img src="${clinicLogo}" alt="Clinic Logo" style="height:45px;width:auto;object-fit:contain;" />
          <div style="font-size:54px;line-height:1;color:#7c7469;font-weight:300;letter-spacing:0.02em;">${escapeHtml(clinicName).toUpperCase()}</div>
        </div>
        <div style="margin-top:12px;border-top:1px solid #d4cec6;border-bottom:1px solid #d4cec6;display:grid;grid-template-columns:1fr 1fr;">
          <div style="padding:10px 12px;text-align:center;color:#726a61;">
            <div>Dr Jaime Jonsson</div>
            <div>${escapeHtml(clinicAddressLine || 'Address not available')}</div>
          </div>
          <div style="padding:10px 12px;border-left:1px solid #d4cec6;text-align:center;color:#726a61;">
            <div>${escapeHtml(clinicEmail)}</div>
            <div>${escapeHtml(clinicWebsite)}</div>
            <div>${escapeHtml(clinicPhone)}</div>
          </div>
        </div>
      </div>
      <p><strong>Date:</strong> ${letterDate}</p>
      <p><strong>RE:</strong> ${reLine}</p>
      <p><strong>Address:</strong> ${fullAddress}</p>
      <p><strong>Authorization Code:</strong> ${authorizationCode}</p>
      <p><strong>Customer Number:</strong> ${customerNumber}</p>
      <p><br></p>
      <p>To Whom it may concern,</p>
      <p><br></p>
      <p></p>
      <p><br></p>
      <p>Please do not hesitate to contact me further with any questions,</p>
      <p>Yours sincerely,</p>
      <p><br></p>
      <p><br></p>
      <p>Dr Jaime Jonsson</p>
      <p>Founder and Clinical Director of UK Inkind</p>
      <p>Consultant Clinical Psychologist</p>
    `;
  }, [client?.name, clientRaw, fullAddress, letterDate, clinicLogo, clinicName, clinicAddressLine, clinicEmail, clinicWebsite, clinicPhone]);

  useEffect(() => {
    if (clinicLoading) return;
    setRecipientEmail(client?.email || '');
    setSubject(`Letter for ${client?.name || 'Client'}`);
    setDocumentTitle(client?.name ? `${client.name} - Letter` : 'Untitled Letter');
    if (editorRef.current) {
      editorRef.current.innerHTML = initialTemplateHtml;
    }
  }, [client?.email, client?.name, initialTemplateHtml, clinicLoading]);

  const normalizeText = (value?: string | null) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  const getBodyBounds = () => {
    const container = editorRef.current;
    if (!container) return null;
    const nodes = Array.from(container.children) as HTMLElement[];
    const openingIndex = nodes.findIndex((node) => normalizeText(node.textContent) === normalizeText(OPENING_LINE));
    const closingIndex = nodes.findIndex((node) => normalizeText(node.textContent) === normalizeText(CLOSING_LINE));
    if (openingIndex === -1 || closingIndex === -1 || closingIndex <= openingIndex) return null;
    return { nodes, openingIndex, closingIndex };
  };

  const extractMainBody = () => {
    const bounds = getBodyBounds();
    const container = editorRef.current;
    if (!container) return '';
    if (!bounds) return (container.innerText || '').trim();

    const middleNodes = bounds.nodes.slice(bounds.openingIndex + 1, bounds.closingIndex);
    const text = middleNodes
      .map((node) => (node.textContent || '').trim())
      .filter(Boolean)
      .join('\n\n')
      .trim();
    return text;
  };

  const injectEnhancedBody = (enhancedText: string) => {
    const bounds = getBodyBounds();
    const container = editorRef.current;
    if (!container || !bounds) {
      container && (container.innerText = enhancedText);
      return;
    }

    const { nodes, openingIndex, closingIndex } = bounds;
    for (let i = closingIndex - 1; i > openingIndex; i--) {
      nodes[i].remove();
    }

    const lines = enhancedText.split('\n');
    const fragment = document.createDocumentFragment();
    lines.forEach((line) => {
      const p = document.createElement('p');
      const trimmed = line.trim();
      if (trimmed) {
        p.textContent = trimmed;
      } else {
        p.innerHTML = '<br>';
      }
      fragment.appendChild(p);
    });

    nodes[closingIndex].before(fragment);
  };

  const handleSend = () => {
    void (async () => {
      const content = (editorRef.current?.innerText || '').trim();
      const clientId = client?.id;
      const clinicianId = clientRaw?.assignedClinicianId || clientRaw?.clinicMemberId;

      if (!clientId) {
        setStatusMessage('Client ID is missing. Unable to send.');
        return;
      }
      if (!clinicianId) {
        setStatusMessage('Clinician ID is missing for this client.');
        return;
      }
      if (content.length < 10) {
        setStatusMessage('Letter content must be at least 10 characters.');
        return;
      }

      try {
        await sendEmail({
          clientId,
          clinicianId,
          content,
          subject: subject || documentTitle || 'Message from your clinician',
        }).unwrap();
        setStatusMessage('Email sent successfully.');
      } catch (error: any) {
        setStatusMessage(error?.data?.message || 'Failed to send email.');
      }
    })();
  };

  const handleAiEnhance = () => {
    void (async () => {
      const content = extractMainBody();
      if (content.length < 10) {
        setStatusMessage('Please write at least 10 characters before enhancing.');
        return;
      }

      try {
        const response = await enhanceEmail({
          content,
          tone: 'professional',
          purpose: (subject || `Letter for ${client?.name || 'client'}`).slice(0, 100),
        }).unwrap();

        const enhancedText = (
          response?.data?.enhanced ||
          (response as any)?.response?.data?.enhanced ||
          (response as any)?.response?.data?.message ||
          ''
        ).trim();
        if (enhancedText && editorRef.current) {
          injectEnhancedBody(enhancedText);
          setStatusMessage('Letter enhanced successfully.');
        } else {
          setStatusMessage('Enhancement completed but no enhanced text was returned.');
        }
      } catch (error: any) {
        setStatusMessage(error?.data?.message || 'Failed to enhance letter.');
      }
    })();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`/clients/${id}/details`)}
          className="rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-5 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-8 space-y-5">
              
                <div className="mx-auto max-w-4xl rounded-md border border-border/60 bg-white shadow-sm min-h-[620px]">
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-[560px] px-6 py-5 text-sm leading-7 text-foreground outline-none"
                  />
                
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleAiEnhance} className="px-6 rounded-xl h-11" isLoading={isEnhancing}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Enhance Letter
                </Button>
                <Button type="button" onClick={handleSend} className="px-8 rounded-xl h-11" isLoading={isSending}>
                  Send
                </Button>
              </div>
              {statusMessage && (
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              )}
            </div>

            <div className="xl:col-span-4">
              <Card className="border-border/60 shadow-sm h-full">
                <CardContent className="p-5 space-y-5">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Avatar
                      src={clientRaw?.avatar}
                      alt={client?.name}
                      fallback={client?.name?.split(' ').map((n) => n[0]).join('') || 'CL'}
                      size="xl"
                      className="h-20 w-20 text-xl"
                    />
                    <div>
                      <p className="text-lg font-semibold text-foreground">{client?.name || 'Client'}</p>
                      <p className="text-xs text-muted-foreground">{client?.status || 'Active'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Contact</p>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary/70" /> {client?.email || '-'}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary/70" /> {client?.phone || '-'}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Address</p>
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary/70 mt-0.5 shrink-0" />
                        <span>{fullAddress}</span>
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Insurance</p>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary/70" /> Authorization: {clientRaw?.insuranceAuthorizationNumber || '-'}</p>
                        <p>Customer Number: {clientRaw?.insuranceNumber || '-'}</p>
                        <p>Provider: {clientRaw?.insuranceProvider || '-'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
