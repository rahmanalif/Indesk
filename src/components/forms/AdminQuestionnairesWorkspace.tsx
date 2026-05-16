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
    if (!raw) return SEED_TEMPLATES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_TEMPLATES;
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
        : 'Clinician';

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
  const [editingTemplate, setEditingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [sendingTemplate, setSendingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | AdminQuestionnaireCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [clinicianSearchTerm, setClinicianSearchTerm] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);

  const { data: clinicResponse } = useGetClinicQuery();
  const { data: clinicMembersResponse, isLoading: isRecipientsLoading } = useGetClinicMembersQuery({ page: 1, limit: 100 });

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
    const members = clinicMembersResponse?.response?.data?.docs || [];
    return members
      .map(buildRecipientFromMember)
      .filter((item): item is Recipient => Boolean(item))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clinicMembersResponse]);

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

  const selectedRecipients = useMemo(
    () => recipients.filter((recipient) => selectedRecipientIds.includes(recipient.id)),
    [recipients, selectedRecipientIds]
  );

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
      notify.success('Admin questionnaire updated.');
      return;
    }

    const nextTemplate: AdminQuestionnaireTemplate = {
      id: `admin-template-${crypto.randomUUID()}`,
      ...draft,
      updatedAt: now,
      isSystemTemplate: false,
    };

    setTemplates((prev) => [nextTemplate, ...prev]);
    notify.success('Admin questionnaire created.');
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
              <h2 className="text-xl font-bold text-foreground">Admin & Clinic Questionnaires</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a template, hit send, edit it in the modal, choose clinicians, and send the email.
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
                    placeholder={selectedRecipientIds.length === 0 ? "Select clinicians..." : ""}
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
                      {visibleRecipients
                        .filter((r) => !selectedRecipientIds.includes(r.id))
                        .map((recipient) => (
                          <button
                            key={recipient.id}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center justify-between group"
                            onClick={() => {
                              toggleRecipient(recipient.id);
                              setClinicianSearchTerm('');
                              // We keep it open so they can select more easily, 
                              // or close it if you prefer. Gmail keeps it open if focused.
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
                          All available clinicians selected
                        </div>
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
    </div>
  );
}
