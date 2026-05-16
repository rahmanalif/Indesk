import { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  FilePenLine,
  Mail,
  PencilLine,
  Plus,
  Search,
  Send,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { notify } from '../ui/ToastHost';
import { cn } from '../../lib/utils';
import {
  useGetClinicMembersQuery,
  useGetClinicQuery,
  useGetClientsQuery,
  type ClinicMemberItem,
} from '../../redux/api/clientsApi';
import {
  AdminQuestionnaireModal,
  type AdminQuestionnaireCategory,
  type AdminQuestionnaireTemplate,
} from '../modals/AdminQuestionnaireModal';

const STORAGE_KEY = 'admin_questionnaire_templates_v1';
const ADMIN_QUESTIONNAIRE_RECIPIENT_ROLES = new Set(['clinician', 'admin', 'superadmin']);

const CATEGORY_LABELS: Record<AdminQuestionnaireCategory, string> = {
  agreement: 'Agreement',
  consent: 'Consent',
  intake: 'Intake',
  feedback: 'Feedback',
  letter: 'Letter',
  admin: 'Admin',
};

const SEED_TEMPLATES: AdminQuestionnaireTemplate[] = [
  {
    id: 'system-associate-welcome-letter',
    title: 'New Associate Welcome Letter',
    category: 'letter',
    description: 'Standard welcome letter for new associate clinicians joining the practice.',
    content:
      '[CLINIC NAME]\nNew Associate Welcome Letter\nConfidential — for recipient only\n\nDear [RECIPIENT NAME],\n\nOn behalf of [CLINIC NAME], I would like to warmly welcome you to the team. We are delighted to have you join us and look forward to working together.\n\nPlease read the information below carefully, sign and return the attached contract at your earliest convenience, and complete the enclosed clinician details form.\n\n  Fees & Payment Structure\nOur standard fee for online therapy sessions is [£XX] per session for self-paying clients. For each session booked with one of our clients, the practice retains a fee of [£XX] per session and [X]% of total assessment fees. Please complete the enclosed form with details of any health insurance companies you are registered with and the applicable fees.\n\n  Your Clinician Profile\nTo add you to our website, we would be grateful if you could provide:\n- A professional photograph, consistent in style with existing clinician photos on our website [WEBSITE URL].\n- A brief profile statement written using the same headings and structure as existing clinician profiles on the website.\n- A list of your clinical specialisms.\n- One or two brief anonymised client testimonials or reviews, if available.\n\n  DBS Certificate\nPlease send a copy of your current DBS (Disclosure and Barring Service) certificate. If your certificate is on the DBS Update Service, please let us know your reference number so that we can carry out a status check.\n\n  Email & Communication\nYou may wish to set up a [CLINIC NAME] email address (e.g. firstname@[DOMAIN]) for communication with the practice and with clients. Please let us know if you would like one arranged, or if you prefer to use your own professional email address.\n\n  Practice Management Software\nWe use [PRACTICE MANAGEMENT SOFTWARE] as our practice management platform. Once a provisional client has been identified for you, we will arrange access and provide initial onboarding training.\n\n  Clinician Group\nWe have a [WhatsApp / Teams / other] group for associates and clinicians where we share updates, ideas, and keep in touch. We will add you to this shortly. Please let us know if you have any preference for communication platform.\n\nIf you have any questions before we meet, please do not hesitate to get in touch. We very much look forward to having you on board.\n\nWith warm regards,\n\n[DIRECTOR NAME]\n[TITLE], [CLINIC NAME]\n[EMAIL]  |  [PHONE]\n\n[CLINIC NAME]  |  [ADDRESS]  |  [EMAIL]  |  [WEBSITE]',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
  {
    id: 'system-clinician-details-form',
    title: 'Clinician Details Form',
    category: 'admin',
    description: 'Form for collecting professional, contact, and bank details from clinicians.',
    content:
      '[CLINIC NAME]\nClinician Details Form\nPlease complete and return — keep a copy for your own records\n\nPlease fill in your contact details below and return a completed copy to [EMAIL]. Save a copy for yourself as it will also include the contact details of other clinicians once collated.\n\n  Personal & Professional Details\nFull Name: [RECIPIENT NAME]\nPreferred Name / Title:\nProfessional Qualifications:\nRegulatory Body & Reg. No.:\nHCPC / BACP / BPS No.:\nDate of Birth:\n\n  Contact Details\nPersonal Email:\nPractice Email (if applicable):\nMobile Number:\nHome Address:\nEmergency Contact Name:\nEmergency Contact Number:\n\n  Clinical Details\nClinical Specialisms:\nTherapeutic Approaches:\nAge Groups Worked With:\nLanguages Spoken:\nDBS Certificate Number:\nDBS Issue Date:\nDBS Update Service (Y/N):\nIndemnity Insurer:\nIndemnity Policy Number:\nIndemnity Expiry Date:\n\n  Insurance Panels\nPlease list any health insurance companies you are registered with and the applicable session fees:\nInsurance Provider | Panel Member No. | Session Fee (£)\n\n\n\n\n\n  Bank Details (for payment)\nAccount Holder Name:\nBank Name:\nSort Code:\nAccount Number:\n\n[CLINIC NAME]  |  [ADDRESS]  |  [EMAIL]  |  [WEBSITE]',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
  {
    id: 'system-freelance-admin-agreement',
    title: 'Freelance Administrative Staff Agreement',
    category: 'agreement',
    description: 'Contractual agreement for freelance administrative support staff.',
    content:
      '[CLINIC NAME]\nFreelance Administrative Staff Agreement\nThis Freelance Administrative Staff Agreement (the "Agreement") is entered into on [DATE], by and between:\n\n[CLINIC NAME], a [limited company / sole trader / other] with its principal place of business at [ADDRESS] ("the Company");\nand\n[RECIPIENT NAME], an independent contractor residing at [RECIPIENT ADDRESS] ("the Freelancer").\n\n  Recitals\nWHEREAS, the Company provides [psychological therapy / healthcare / other] services and requires freelance administrative support to assist with day-to-day operations;\nWHEREAS, the Freelancer possesses the necessary skills and experience to provide administrative services as described herein and is willing to do so on a freelance basis;\nNOW, THEREFORE, the parties agree as follows:\n\n1.  Scope of Services\nThe Freelancer agrees to provide the following administrative services (the "Services"):\n- Scheduling client appointments and managing the practice diary.\n- Managing client databases and records.\n- Answering phone calls and responding to emails on behalf of the practice.\n- Compiling invoices and recording bookkeeping data.\n- Assisting in the preparation of reports, documents, and other administrative tasks.\n- Other administrative duties as reasonably assigned by the Company.\n\n2.  Term\nThis Agreement will commence on [START DATE] and continue until terminated by either party in accordance with Clause 7.\n\n3.  Fees and Payment\nThe Freelancer will be compensated at a rate of [£X] per hour, payable [monthly / fortnightly / on completion].\nThe Freelancer shall submit invoices to [BILLING EMAIL] no later than the last working day of each month.\nPayment will be made by the Company within [30] days of receiving a valid invoice.\n\n4.  Independent Contractor Status\nThe Freelancer is an independent contractor and not an employee of the Company. Nothing in this Agreement shall be construed to create an employer-employee relationship, partnership, or joint venture. The Freelancer is solely responsible for all taxes, national insurance, and other liabilities arising from the provision of Services.\n\n5.  Confidentiality\nThe Freelancer agrees to maintain strict confidentiality of all information related to the Company\'s business, including client records, financial data, proprietary materials, and any other sensitive information ("Confidential Information").\nThe Freelancer shall not disclose, share, or use any Confidential Information for any purpose other than the performance of the Services, during or after the term of this Agreement.\nThe Freelancer acknowledges that client data is subject to UK GDPR and agrees to handle all personal data in accordance with applicable data protection legislation.\n\n6.  Intellectual Property\nAny materials, documents, reports, or work products created by the Freelancer in the course of performing the Services shall be the property of the Company. The Freelancer agrees to assign all rights in such work to the Company upon creation.\n\n7.  Termination\nEither party may terminate this Agreement by giving [14] days\' written notice to the other party. Upon termination, the Freelancer shall be entitled to payment for all Services rendered up to the date of termination.\n\n8.  Non-Compete and Non-Solicitation\nNon-Compete: During the term of this Agreement and for [X] months/years after termination, the Freelancer shall not engage in or assist any business that directly competes with the Company in the provision of [psychological / healthcare] services.\nNon-Solicitation: During the term of this Agreement and for [X] months/years after termination, the Freelancer shall not directly or indirectly solicit the Company\'s clients, referrers, or staff.\n\n9.  Indemnity\nThe Freelancer agrees to indemnify and hold harmless the Company from any claims, damages, liabilities, and expenses arising out of the Freelancer\'s performance of the Services, including claims related to negligence or breach of this Agreement.\n\n10.  General Provisions\nAmendments: Any amendments or modifications must be made in writing and signed by both parties.\nGoverning Law: This Agreement is governed by the laws of England and Wales.\nDispute Resolution: Any dispute arising from this Agreement shall be resolved through mediation in England and Wales, before recourse to litigation.\nSeverability: If any provision is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.\n\nSignatures\nThis Agreement comes into effect when signed by both parties.\n\nFor and on behalf of the Company:\nName:  _______________________________________________\nSignature:  _______________________________________________\nDate:  _______________________________________________\nFreelancer:\nName:  _______________________________________________\nSignature:  _______________________________________________\nDate:  _______________________________________________\n\n[CLINIC NAME]  |  [ADDRESS]  |  [EMAIL]  |  [WEBSITE]',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
  {
    id: 'system-associate-licence-agreement',
    title: 'Associate Licence Agreement',
    category: 'agreement',
    description: 'Reusable onboarding agreement for bringing a new associate clinician into the practice.',
    content:
      'Dear [CLINICIAN NAME],\n\nAs Director of [CLINIC NAME], I am pleased to welcome you to the practice.\n\nPlease review the agreement below, update any placeholders, and return the signed copy.\n\nPractice fee structure:\n- [FEE DETAILS]\n- [ASSESSMENT DETAILS]\n\nNotice period: [NOTICE PERIOD]\n\nWarm regards,\n[DIRECTOR NAME]\n[TITLE]\n\n---\n\nASSOCIATE LICENCE AGREEMENT\nDate: [DATE]\nPractice legal name: [PRACTICE LEGAL NAME]\nAssociate full name: [CLINICIAN NAME]\n\n1. Duties of the Associate\n- Promote the clinic services in good faith\n- Follow clinic standards and approved materials\n- Keep accurate records in [PRACTICE SOFTWARE NAME]\n\n2. Payment\n- Session fee retained by Associate, less clinic practice fee\n- Monthly invoice issued by the clinic\n\n3. Termination\n- Either party may terminate on [NOTICE PERIOD] written notice\n\nSignatures\nAssociate: __________________\nDirector: __________________\nDate: __________________',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
  {
    id: 'system-clinic-consent-form',
    title: 'General Consent Form',
    category: 'consent',
    description: 'Baseline consent language for sharing before work begins.',
    content:
      'Name: [CLINICIAN NAME]\nDate: [DATE]\n\nI confirm that I understand the nature of the services and expectations provided by [CLINIC NAME].\n\nI understand:\n- My information will be stored securely\n- I can withdraw consent where legally permissible\n- I may ask questions before treatment begins\n\nSignature: __________________',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
  {
    id: 'system-clinician-feedback-form',
    title: 'Clinician Feedback Template',
    category: 'feedback',
    description: 'Simple internal feedback document for staff or associate clinicians.',
    content:
      'Clinician Name: [CLINICIAN NAME]\nDate: [DATE]\n\n1. What has been working well in the clinic?\n\n2. What could be improved operationally?\n\n3. Do you feel supported in your current role?\n\n4. Any additional comments?\n',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
];

type Recipient = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const getStoredTemplates = (): AdminQuestionnaireTemplate[] => {
  if (typeof window === 'undefined') return SEED_TEMPLATES;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const systemIds = new Set(SEED_TEMPLATES.map(t => t.id));
    
    if (!raw) return SEED_TEMPLATES;
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED_TEMPLATES;

    // Filter out old system templates from localStorage to avoid duplicates 
    // and ensure we use the latest versions from SEED_TEMPLATES
    const userTemplates = parsed.filter(t => !systemIds.has(t.id));
    
    return [...SEED_TEMPLATES, ...userTemplates];
  } catch {
    return SEED_TEMPLATES;
  }
};

const normalizeRole = (value?: string | null) => String(value || '').trim().toLowerCase();

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-GB');

const buildRecipientFromMember = (member: ClinicMemberItem): Recipient | null => {
  if (!member.user) return null;
  if (!ADMIN_QUESTIONNAIRE_RECIPIENT_ROLES.has(normalizeRole(member.role))) return null;

  const fullName = `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim();

  return {
    id: member.id,
    name: fullName || member.user.email || 'Clinician',
    email: member.user.email || '',
    role: member.role || 'Clinician',
  };
};

const buildRecipientFromClient = (client: any): Recipient => {
  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
  return {
    id: client.id,
    name: fullName || client.email || 'Client',
    email: client.email || '',
    role: 'Client',
  };
};

const applyTemplatePlaceholders = (
  content: string,
  clinicName: string,
  todayLabel: string,
  selectedRecipients: Recipient[]
) => {
  const recipientLabel =
    selectedRecipients.length === 1
      ? selectedRecipients[0].name
      : selectedRecipients.length > 1
        ? 'Team'
        : 'Recipient';

  return content
    .replaceAll('[CLINIC NAME]', clinicName)
    .replaceAll('[DATE]', todayLabel)
    .replaceAll('[CLINICIAN NAME]', recipientLabel)
    .replaceAll('[RECIPIENT NAME]', recipientLabel);
};

const buildGroupMailtoLink = (emails: string[], subject: string, body: string) => {
  const params = new URLSearchParams({
    subject,
    body,
  });

  if (emails.length > 1) {
    params.set('bcc', emails.join(','));
    return `mailto:?${params.toString()}`;
  }

  return `mailto:${emails[0] || ''}?${params.toString()}`;
};

export function AdminQuestionnairesWorkspace() {
  const [templates, setTemplates] = useState<AdminQuestionnaireTemplate[]>(getStoredTemplates);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [sendingTemplate, setSendingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | AdminQuestionnaireCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [clinicianSearchTerm, setClinicianSearchTerm] = useState('');
  const [recipientType, setRecipientType] = useState<'clinician' | 'client'>('clinician');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);

  const { data: clinicResponse } = useGetClinicQuery();
  const { data: clinicMembersResponse, isLoading: isRecipientsLoading } = useGetClinicMembersQuery({ page: 1, limit: 100 });
  const { data: clientsResponse, isLoading: isClientsLoading } = useGetClientsQuery({ page: 1, limit: 100 });

  const clinicName = clinicResponse?.response?.data?.name || 'Your Clinic';
  const todayLabel = useMemo(() => new Date().toLocaleDateString('en-GB'), []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates
      .filter((template) => statusFilter === 'all' || template.status === statusFilter)
      .filter((template) => categoryFilter === 'All' || template.category === categoryFilter)
      .filter((template) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;
        return (
          template.title.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.content.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [templates, statusFilter, categoryFilter, searchTerm]);

  const recipients = useMemo(() => {
    if (recipientType === 'clinician') {
      const members = clinicMembersResponse?.response?.data?.docs || [];
      return members
        .map(buildRecipientFromMember)
        .filter((item): item is Recipient => Boolean(item))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      const clients = clientsResponse?.response?.data?.docs || [];
      return clients
        .map(buildRecipientFromClient)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [clinicMembersResponse, clientsResponse, recipientType]);

  const visibleRecipients = useMemo(() => {
    const query = clinicianSearchTerm.trim().toLowerCase();
    if (!query) return recipients;

    return recipients.filter((recipient) => {
      return (
        recipient.name.toLowerCase().includes(query) ||
        recipient.email.toLowerCase().includes(query) ||
        recipient.role.toLowerCase().includes(query)
      );
    });
  }, [recipients, clinicianSearchTerm]);

  const selectedRecipients = useMemo(() => {
    const members = (clinicMembersResponse?.response?.data?.docs || [])
      .map(buildRecipientFromMember)
      .filter((item): item is Recipient => Boolean(item));
    
    const clients = (clientsResponse?.response?.data?.docs || [])
      .map(buildRecipientFromClient);

    const allPossible = [...members, ...clients];
    return allPossible.filter((recipient) => selectedRecipientIds.includes(recipient.id));
  }, [clinicMembersResponse, clientsResponse, selectedRecipientIds]);

  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const handleSave = (draft: Omit<AdminQuestionnaireTemplate, 'id' | 'updatedAt'>) => {
    const now = new Date().toISOString();

    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === editingTemplate.id
            ? { ...template, ...draft, updatedAt: now, isSystemTemplate: false }
            : template
        )
      );
      notify.success('Clinic admin template updated.');
      return;
    }

    const nextTemplate: AdminQuestionnaireTemplate = {
      id: `admin-template-${crypto.randomUUID()}`,
      ...draft,
      updatedAt: now,
      isSystemTemplate: false,
    };

    setTemplates((prev) => [nextTemplate, ...prev]);
    notify.success('Clinic admin template created.');
  };

  const handleDuplicate = (template: AdminQuestionnaireTemplate) => {
    const duplicate: AdminQuestionnaireTemplate = {
      ...template,
      id: `admin-template-${crypto.randomUUID()}`,
      title: `${template.title} Copy`,
      updatedAt: new Date().toISOString(),
      isSystemTemplate: false,
      status: 'active',
    };

    setTemplates((prev) => [duplicate, ...prev]);
    notify.success(`Duplicated "${template.title}".`);
  };

  const handleArchiveToggle = (template: AdminQuestionnaireTemplate) => {
    const nextStatus = template.status === 'active' ? 'archived' : 'active';

    setTemplates((prev) =>
      prev.map((item) =>
        item.id === template.id
          ? { ...item, status: nextStatus, updatedAt: new Date().toISOString(), isSystemTemplate: false }
          : item
      )
    );

    notify.success(nextStatus === 'archived' ? 'Template archived.' : 'Template restored.');
  };

  const handleCopy = async (template: AdminQuestionnaireTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      notify.success(`Copied "${template.title}" content.`);
    } catch {
      notify.error('Could not copy template content.');
    }
  };

  const openSendModal = (template: AdminQuestionnaireTemplate) => {
    setSendingTemplate(template);
    setDraftTitle(template.title);
    setDraftSubject(template.title);
    setDraftContent(template.content);
    setClinicianSearchTerm('');
    setSelectedRecipientIds([]);
    setIsSendModalOpen(true);
  };

  const openPreviewModal = (template: AdminQuestionnaireTemplate) => {
    setPreviewingTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(recipientId) ? prev.filter((id) => id !== recipientId) : [...prev, recipientId]
    );
  };

  const previewContent = applyTemplatePlaceholders(draftContent, clinicName, todayLabel, selectedRecipients);
  const selectedEmails = selectedRecipients.map((recipient) => recipient.email).filter(Boolean);
  const canSend = Boolean(draftSubject.trim() && draftContent.trim() && selectedEmails.length > 0);

  return (
    <div className="space-y-6">
      <Card className="border-none overflow-hidden rounded-xl shadow-sm">
        <div className="border-b border-border/50 bg-white px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Clinic Admin</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a template, hit send, edit it in the modal, choose recipients, and send the email.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </div>

        <div className="bg-white px-6 py-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_220px_220px]">
            {/* <Input
              label="Search"
              placeholder="Search templates..."
              icon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            /> */}
            <Select
              label="Category"
              value={categoryFilter}
              options={categoryOptions}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | AdminQuestionnaireCategory)}
            />
            <Select
              label="Status"
              value={statusFilter}
              options={[
                { value: 'active', label: 'Active Only' },
                { value: 'archived', label: 'Archived Only' },
                { value: 'all', label: 'All Statuses' },
              ]}
              onChange={(e) => setStatusFilter(e.target.value as 'active' | 'archived' | 'all')}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="border-border/60 rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{template.title}</h3>
                  {template.isSystemTemplate ? <Badge variant="secondary">Starter</Badge> : null}
                  <Badge variant={template.status === 'active' ? 'success' : 'secondary'}>
                    {template.status === 'active' ? 'Active' : 'Archived'}
                  </Badge>
                  <Badge variant="secondary">{CATEGORY_LABELS[template.category]}</Badge>
                </div>
                <p className="max-w-3xl text-sm text-muted-foreground">{template.description}</p>
                <p className="text-xs text-muted-foreground">Updated {formatDate(template.updatedAt)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => openSendModal(template)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openPreviewModal(template)}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template);
                    setIsTemplateModalOpen(true);
                  }}
                >
                  <PencilLine className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)}>
                  <FilePenLine className="mr-2 h-3.5 w-3.5" />
                  Duplicate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(template)}>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleArchiveToggle(template)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  {template.status === 'active' ? 'Archive' : 'Restore'}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredTemplates.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/70 bg-white px-6 py-12 text-center text-muted-foreground shadow-sm">
            No templates found.
          </Card>
        ) : null}
      </div>

      <Modal
        isOpen={isSendModalOpen}
        onClose={() => {
          setIsSendModalOpen(false);
          setSendingTemplate(null);
        }}
        title={` ${draftTitle}`}
        size="lg"
        className="p-0 overflow-hidden"
        bodyClassName="overflow-hidden p-0"
      >
        <div className="flex flex-col h-[600px] bg-white">
          {/* Recipient Type Toggle */}
          <div className="flex items-center px-4 py-3 bg-muted/20 border-b border-border/40 gap-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recipient Type:</span>
            <div className="flex bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => {
                  setRecipientType('clinician');
                  setClinicianSearchTerm('');
                }}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  recipientType === 'clinician' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Staff (Clinicians)
              </button>
              <button
                onClick={() => {
                  setRecipientType('client');
                  setClinicianSearchTerm('');
                }}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  recipientType === 'client' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Patients (Clients)
              </button>
            </div>
          </div>

          {/* Recipients Field */}
          <div className="flex items-center px-4 py-2 border-b border-border/40 min-h-[48px] relative">
            <span className="text-sm text-muted-foreground mr-3 w-8">To</span>
            <div className="flex-1 flex flex-wrap gap-1 items-center">
              {selectedRecipients.map((recipient) => (
                <Badge
                  key={recipient.id}
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-muted/60 text-foreground border-none"
                >
                  <span className="text-xs">{recipient.name}</span>
                  <button
                    onClick={() => toggleRecipient(recipient.id)}
                    className="hover:bg-muted p-0.5 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <div className="relative flex-1 min-w-[150px]">
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    placeholder={selectedRecipientIds.length === 0 ? `Select ${recipientType === 'clinician' ? 'clinicians' : 'patients'}...` : ""}
                    className="w-full border-none bg-transparent p-1 text-sm outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                    value={clinicianSearchTerm}
                    onChange={(e) => {
                      setClinicianSearchTerm(e.target.value);
                      setIsRecipientDropdownOpen(true);
                    }}
                    onFocus={() => setIsRecipientDropdownOpen(true)}
                  />
                  <button 
                    type="button"
                    onClick={() => setIsRecipientDropdownOpen(!isRecipientDropdownOpen)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground ml-1"
                  >
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isRecipientDropdownOpen && "rotate-180")} />
                  </button>
                </div>
                
                {isRecipientDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsRecipientDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-white shadow-lg no-scrollbar">
                      {(isRecipientsLoading || isClientsLoading) ? (
                        <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                          Loading recipients...
                        </div>
                      ) : (
                        <>
                          {visibleRecipients
                            .filter((r) => !selectedRecipientIds.includes(r.id))
                            .map((recipient) => (
                              <button
                                key={recipient.id}
                                className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center justify-between group"
                                onClick={() => {
                                  toggleRecipient(recipient.id);
                                  setClinicianSearchTerm('');
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{recipient.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{recipient.email}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground uppercase group-hover:text-primary transition-colors">{recipient.role}</span>
                              </button>
                            ))}
                          {visibleRecipients.filter((r) => !selectedRecipientIds.includes(r.id)).length === 0 && (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                              All available recipients selected
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div className="flex items-center px-4 py-1 border-b border-border/40">
            <input
              type="text"
              placeholder="Subject"
              className="w-full border-none bg-transparent py-2 text-sm outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              value={draftSubject}
              onChange={(e) => setDraftSubject(e.target.value)}
            />
          </div>

          {/* Body / Content Field */}
          <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
            <textarea
              className="no-scrollbar h-full w-full resize-none border-none bg-transparent py-2 font-sans text-sm leading-relaxed outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Write your message here..."
            />
          </div>

          {/* Placeholders Hint */}
          <div className="px-4 py-2 text-[10px] text-muted-foreground bg-muted/5 border-t border-border/30">
            Placeholders: [CLINICIAN NAME], [RECIPIENT NAME], [CLINIC NAME], [DATE]
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between bg-muted/5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="rounded-full px-6 shadow-sm"
                onClick={() => {
                  if (!canSend) return;
                  window.location.href = buildGroupMailtoLink(selectedEmails, draftSubject.trim(), previewContent.trim());
                  notify.success(selectedEmails.length > 1 ? 'Email draft opened for selected clinicians.' : 'Email draft opened.');
                }}
                disabled={!canSend}
              >
                Send
                <Send className="ml-2 h-3 w-3" />
              </Button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(previewContent);
                    notify.success('Content copied to clipboard.');
                  } catch {
                    notify.error('Failed to copy content.');
                  }
                }}
                className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                title="Copy formatted content"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground mr-2 italic">
                {selectedRecipients.length} {selectedRecipients.length === 1 ? 'recipient' : 'recipients'}
              </span>
              <button 
                onClick={() => {
                  setIsSendModalOpen(false);
                  setSendingTemplate(null);
                }}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-md text-muted-foreground transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <AdminQuestionnaireModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSave}
        template={editingTemplate}
      />

      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewingTemplate(null);
        }}
        title={`Preview: ${previewingTemplate?.title}`}
        size="lg"
      >
        <div className="bg-muted/30 rounded-xl p-8 border border-border/50 min-h-[400px]">
          <div className="max-w-none prose prose-sm prose-slate">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {previewingTemplate ? applyTemplatePlaceholders(previewingTemplate.content, clinicName, todayLabel, []) : ''}
            </pre>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
            Close
          </Button>
          <Button onClick={() => {
            setIsPreviewModalOpen(false);
            if (previewingTemplate) openSendModal(previewingTemplate);
          }}>
            <Send className="mr-2 h-4 w-4" />
            Send This
          </Button>
        </div>
      </Modal>
    </div>
  );
}
