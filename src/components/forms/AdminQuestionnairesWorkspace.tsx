import { useMemo, useState } from 'react';
import {
  Copy,
  FilePenLine,
  PencilLine,
  Plus,
  Send,
  Trash2,
  X,
  ChevronDown,
  Eye,
  Loader2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import { Modal } from '../ui/Modal';
import { notify } from '../ui/ToastHost';
import { cn, getFriendlyErrorMessage } from '../../lib/utils';
import {
  useGetClinicMembersQuery,
  useGetClinicQuery,
  useGetClientsQuery,
  type ClinicMemberItem,
} from '../../redux/api/clientsApi';
import {
  useCopyClinicAdminTemplateMutation,
  useCreateClinicAdminTemplateMutation,
  useGetClinicAdminTemplatesQuery,
  useSendClinicAdminTemplateMutation,
  useUpdateClinicAdminTemplateMutation,
  useUpdateClinicAdminTemplateStatusMutation,
  type ClinicAdminTemplate,
} from '../../redux/api/clinicAdminTemplateApi';
import {
  AdminQuestionnaireModal,
  type AdminQuestionnaireCategory,
  type AdminQuestionnaireTemplate,
} from '../modals/AdminQuestionnaireModal';

const ADMIN_QUESTIONNAIRE_RECIPIENT_ROLES = new Set(['clinician', 'admin', 'superadmin']);

const CATEGORY_LABELS: Record<AdminQuestionnaireCategory, string> = {
  agreement: 'Agreement',
  consent: 'Consent',
  intake: 'Intake',
  feedback: 'Feedback',
  letter: 'Letter',
  admin: 'Admin',
};

type Recipient = {
  id: string;
  name: string;
  email: string;
  role: string;
  type: 'clinician' | 'client';
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
    type: 'clinician',
  };
};

const buildRecipientFromClient = (client: any): Recipient => {
  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
  return {
    id: client.id,
    name: fullName || client.email || 'Client',
    email: client.email || '',
    role: 'Client',
    type: 'client',
  };
};

const applyTemplatePlaceholders = (
  content: string,
  clinicName: string,
  todayLabel: string,
  selectedRecipients: Recipient[],
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

export function AdminQuestionnairesWorkspace() {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [sendingTemplate, setSendingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'All' | AdminQuestionnaireCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [clinicianSearchTerm, setClinicianSearchTerm] = useState('');
  const [recipientType, setRecipientType] = useState<'clinician' | 'client'>('clinician');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data: clinicResponse } = useGetClinicQuery();
  const { data: clinicMembersResponse, isLoading: isRecipientsLoading } = useGetClinicMembersQuery({
    page: 1,
    limit: 100,
  });
  const { data: clientsResponse, isLoading: isClientsLoading } = useGetClientsQuery({
    page: 1,
    limit: 100,
  });

  const {
    data: templatesResponse,
    isLoading: isTemplatesLoading,
    isError: isTemplatesError,
    refetch: refetchTemplates,
  } = useGetClinicAdminTemplatesQuery({
    category: categoryFilter,
    status: statusFilter,
  });

  const [createTemplate] = useCreateClinicAdminTemplateMutation();
  const [updateTemplate] = useUpdateClinicAdminTemplateMutation();
  const [copyTemplate] = useCopyClinicAdminTemplateMutation();
  const [updateStatus] = useUpdateClinicAdminTemplateStatusMutation();
  const [sendTemplate] = useSendClinicAdminTemplateMutation();

  const templates = templatesResponse?.response?.data || [];
  const clinicName = clinicResponse?.response?.data?.name || 'Your Clinic';
  const todayLabel = useMemo(() => new Date().toLocaleDateString('en-GB'), []);

  const filteredTemplates = useMemo(() => {
    return [...templates].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [templates]);

  const recipients = useMemo(() => {
    if (recipientType === 'clinician') {
      const members = clinicMembersResponse?.response?.data?.docs || [];
      return members
        .map(buildRecipientFromMember)
        .filter((item): item is Recipient => Boolean(item))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    const clients = clientsResponse?.response?.data?.docs || [];
    return clients
      .map(buildRecipientFromClient)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [recipientType, clinicMembersResponse, clientsResponse]);

  const filteredRecipients = useMemo(() => {
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
    const clients = (clientsResponse?.response?.data?.docs || []).map(buildRecipientFromClient);
    const allPossible = [...members, ...clients];
    return allPossible.filter((recipient) => selectedRecipientIds.includes(recipient.id));
  }, [clinicMembersResponse, clientsResponse, selectedRecipientIds]);

  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const handleSave = async (draft: {
    title: string;
    category: AdminQuestionnaireCategory;
    description: string;
    content: string;
    status: 'active' | 'archived';
  }) => {
    try {
      if (editingTemplate) {
        await updateTemplate({
          templateId: editingTemplate.id,
          title: draft.title,
          category: draft.category,
          description: draft.description,
          content: draft.content,
          status: draft.status,
        }).unwrap();
        notify.success('Clinic admin template updated.');
        return;
      }

      await createTemplate({
        title: draft.title,
        category: draft.category,
        description: draft.description,
        content: draft.content,
        status: draft.status,
      }).unwrap();
      notify.success('Clinic admin template created.');
    } catch (error) {
      notify.error(getFriendlyErrorMessage(error, 'Failed to save template.'));
      throw error;
    }
  };

  const handleEdit = async (template: ClinicAdminTemplate) => {
    try {
      if (template.isSystemTemplate || template.clinicId === null) {
        const copied = await copyTemplate(template.id).unwrap();
        const copy = copied.response?.data;
        if (!copy) throw new Error('Copy failed');
        setEditingTemplate(copy);
        setIsTemplateModalOpen(true);
        notify.success('Created a clinic copy you can edit.');
        return;
      }

      setEditingTemplate(template);
      setIsTemplateModalOpen(true);
    } catch (error) {
      notify.error(getFriendlyErrorMessage(error, 'Unable to edit template.'));
    }
  };

  const handleDuplicate = async (template: ClinicAdminTemplate) => {
    try {
      await createTemplate({
        title: `${template.title} Copy`,
        category: template.category,
        description: template.description,
        content: template.content,
        status: 'active',
      }).unwrap();
      notify.success(`Duplicated "${template.title}".`);
    } catch (error) {
      notify.error(getFriendlyErrorMessage(error, 'Failed to duplicate template.'));
    }
  };

  const handleArchiveToggle = async (template: ClinicAdminTemplate) => {
    if (template.isSystemTemplate || template.clinicId === null) {
      notify.error('Starter templates cannot be archived. Edit to create your own copy first.');
      return;
    }

    const nextStatus = template.status === 'active' ? 'archived' : 'active';
    try {
      await updateStatus({ templateId: template.id, status: nextStatus }).unwrap();
      notify.success(nextStatus === 'archived' ? 'Template archived.' : 'Template restored.');
    } catch (error) {
      notify.error(getFriendlyErrorMessage(error, 'Failed to update template status.'));
    }
  };

  const handleCopy = async (template: ClinicAdminTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      notify.success(`Copied "${template.title}" content.`);
    } catch {
      notify.error('Could not copy template content.');
    }
  };

  const openSendModal = (template: ClinicAdminTemplate) => {
    setSendingTemplate(template);
    setDraftTitle(template.title);
    setDraftSubject(template.title);
    setDraftContent(template.content);
    setClinicianSearchTerm('');
    setSelectedRecipientIds([]);
    setIsSendModalOpen(true);
  };

  const openPreviewModal = (template: ClinicAdminTemplate) => {
    setPreviewingTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(recipientId) ? prev.filter((id) => id !== recipientId) : [...prev, recipientId],
    );
  };

  const previewContent = applyTemplatePlaceholders(
    draftContent,
    clinicName,
    todayLabel,
    selectedRecipients,
  );
  const selectedEmails = selectedRecipients.map((recipient) => recipient.email).filter(Boolean);
  const canSend = Boolean(draftSubject.trim() && draftContent.trim() && selectedEmails.length > 0);

  const handleSend = async () => {
    if (!sendingTemplate || !canSend) return;
    setIsSending(true);
    try {
      const result = await sendTemplate({
        templateId: sendingTemplate.id,
        subject: draftSubject.trim(),
        body: previewContent.trim(),
        recipients: selectedRecipients.map((recipient) => ({
          id: recipient.id,
          name: recipient.name,
          email: recipient.email,
          role: recipient.role,
          type: recipient.type,
        })),
      }).unwrap();

      const data = result.response?.data;
      if (data?.failureCount && data.failureCount > 0 && data.successCount === 0) {
        notify.error('Failed to send email.');
      } else if (data?.failureCount && data.failureCount > 0) {
        notify.success(`Sent to ${data.successCount} recipient(s); ${data.failureCount} failed.`);
      } else {
        notify.success(
          selectedEmails.length > 1
            ? 'Emails sent to selected recipients.'
            : 'Email sent successfully.',
        );
      }
      setIsSendModalOpen(false);
      setSendingTemplate(null);
    } catch (error) {
      notify.error(getFriendlyErrorMessage(error, 'Failed to send email.'));
    } finally {
      setIsSending(false);
    }
  };

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
            <Select
              label="Category"
              value={categoryFilter}
              options={categoryOptions}
              onChange={(e) =>
                setCategoryFilter(e.target.value as 'All' | AdminQuestionnaireCategory)
              }
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

      {isTemplatesLoading ? (
        <Card className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        </Card>
      ) : null}

      {isTemplatesError ? (
        <Card className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-red-600 mb-4">Failed to load templates.</p>
          <Button variant="outline" onClick={() => refetchTemplates()}>
            Try again
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="border-border/60 rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{template.title}</h3>
                  {template.isSystemTemplate || template.clinicId === null ? (
                    <Badge variant="secondary">Starter</Badge>
                  ) : null}
                  <Badge variant={template.status === 'active' ? 'success' : 'secondary'}>
                    {template.status === 'active' ? 'Active' : 'Archived'}
                  </Badge>
                  <Badge variant="secondary">
                    {CATEGORY_LABELS[template.category as AdminQuestionnaireCategory] ||
                      template.category}
                  </Badge>
                </div>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  {template.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(template.updatedAt)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => openSendModal(template)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openPreviewModal(template)}>
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
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

        {!isTemplatesLoading && !isTemplatesError && filteredTemplates.length === 0 ? (
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
          <div className="flex items-center px-4 py-3 bg-muted/20 border-b border-border/40 gap-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recipient Type:
            </span>
            <div className="flex bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => {
                  setRecipientType('clinician');
                  setClinicianSearchTerm('');
                }}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  recipientType === 'clinician'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
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
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  recipientType === 'client'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Patients (Clients)
              </button>
            </div>
          </div>

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
                    placeholder={
                      selectedRecipientIds.length === 0
                        ? `Select ${recipientType === 'clinician' ? 'clinicians' : 'patients'}...`
                        : ''
                    }
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
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isRecipientDropdownOpen && 'rotate-180',
                      )}
                    />
                  </button>
                </div>

                {isRecipientDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsRecipientDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-white shadow-lg no-scrollbar">
                      {isRecipientsLoading || isClientsLoading ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          Loading recipients...
                        </div>
                      ) : filteredRecipients.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          No recipients found
                        </div>
                      ) : (
                        filteredRecipients.map((recipient) => {
                          const checked = selectedRecipientIds.includes(recipient.id);
                          return (
                            <button
                              key={recipient.id}
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/40"
                              onClick={() => toggleRecipient(recipient.id)}
                            >
                              <Checkbox checked={checked} />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{recipient.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {recipient.email}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                      {filteredRecipients.length > 0 &&
                      filteredRecipients.every((item) =>
                        selectedRecipientIds.includes(item.id),
                      ) ? (
                        <div className="border-t border-border/50 px-3 py-2 text-[10px] text-muted-foreground">
                          All available recipients selected
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center px-4 py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground mr-3 w-8">Subj</span>
            <input
              type="text"
              className="w-full border-none bg-transparent p-1 text-sm outline-none"
              value={draftSubject}
              onChange={(e) => setDraftSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
            <textarea
              className="no-scrollbar h-full w-full resize-none border-none bg-transparent py-2 font-sans text-sm leading-relaxed outline-none"
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Write your message here..."
            />
          </div>

          <div className="px-4 py-2 text-[10px] text-muted-foreground bg-muted/5 border-t border-border/30">
            Placeholders: [CLINICIAN NAME], [RECIPIENT NAME], [CLINIC NAME], [DATE]
          </div>

          <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between bg-muted/5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="rounded-full px-6 shadow-sm"
                onClick={handleSend}
                disabled={!canSend || isSending}
                isLoading={isSending}
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
                {selectedRecipients.length}{' '}
                {selectedRecipients.length === 1 ? 'recipient' : 'recipients'}
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
              {previewingTemplate
                ? applyTemplatePlaceholders(previewingTemplate.content, clinicName, todayLabel, [])
                : ''}
            </pre>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setIsPreviewModalOpen(false);
              if (previewingTemplate) openSendModal(previewingTemplate);
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Send This
          </Button>
        </div>
      </Modal>
    </div>
  );
}
