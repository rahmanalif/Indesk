import { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  FilePenLine,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { notify } from '../ui/ToastHost';
import {
  AdminQuestionnaireModal,
  type AdminQuestionnaireCategory,
  type AdminQuestionnaireTemplate,
} from '../modals/AdminQuestionnaireModal';

const STORAGE_KEY = 'admin_questionnaire_templates_v1';

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
      'Dear [ASSOCIATE NAME],\n\nAs Director of [CLINIC NAME], I am pleased to welcome you to the practice.\n\nPlease review the agreement below, update any placeholders, and return the signed copy.\n\nPractice fee structure:\n- [£XX] per therapy session\n- [X]% of assessment fees\n\nNotice period: [3 months]\n\nWarm regards,\n[DIRECTOR NAME]\n[TITLE]\n\n---\n\nASSOCIATE LICENCE AGREEMENT\nDate: [DATE]\nPractice legal name: [PRACTICE LEGAL NAME]\nAssociate full name: [ASSOCIATE FULL NAME]\n\n1. Duties of the Associate\n- Promote the clinic services in good faith\n- Follow clinic standards and approved materials\n- Keep accurate records in [PRACTICE SOFTWARE NAME]\n\n2. Payment\n- Session fee retained by Associate, less clinic practice fee\n- Monthly invoice issued by the clinic\n\n3. Termination\n- Either party may terminate on [3 months] written notice\n\nSignatures\nAssociate: __________________\nDirector: __________________\nDate: __________________',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
  {
    id: 'system-clinic-consent-form',
    title: 'General Consent Form',
    category: 'consent',
    description: 'Baseline consent language for sharing with clients before treatment begins.',
    content:
      'Client Name: [CLIENT NAME]\nDate: [DATE]\n\nI confirm that I understand the nature of the services provided by [CLINIC NAME].\n\nI understand:\n- My information will be stored securely\n- I can withdraw consent where legally permissible\n- I may ask questions before treatment begins\n\nSignature: __________________',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
  {
    id: 'system-clinician-feedback-form',
    title: 'Clinician Feedback Template',
    category: 'feedback',
    description: 'Simple internal feedback document for staff or associates.',
    content:
      'Clinician Name: [CLINICIAN NAME]\nDate: [DATE]\n\n1. What has been working well in the clinic?\n\n2. What could be improved operationally?\n\n3. Do you feel supported in your current role?\n\n4. Any additional comments?\n',
    status: 'active',
    updatedAt: new Date().toISOString(),
    isSystemTemplate: true,
  },
];

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

export function AdminQuestionnairesWorkspace() {
  const [templates, setTemplates] = useState<AdminQuestionnaireTemplate[]>(getStoredTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminQuestionnaireTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | AdminQuestionnaireCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
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

  useEffect(() => {
    if (!filteredTemplates.length) {
      setSelectedTemplateId('');
      return;
    }
    if (!filteredTemplates.some((template) => template.id === selectedTemplateId)) {
      setSelectedTemplateId(filteredTemplates[0].id);
    }
  }, [filteredTemplates, selectedTemplateId]);

  const selectedTemplate =
    filteredTemplates.find((template) => template.id === selectedTemplateId) ||
    templates.find((template) => template.id === selectedTemplateId) ||
    null;

  const counts = useMemo(
    () => ({
      total: templates.length,
      active: templates.filter((template) => template.status === 'active').length,
      archived: templates.filter((template) => template.status === 'archived').length,
    }),
    [templates]
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
      setSelectedTemplateId(editingTemplate.id);
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
    setSelectedTemplateId(nextTemplate.id);
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
    setSelectedTemplateId(duplicate.id);
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

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm overflow-hidden rounded-xl">
        <div className="border-b border-border/50 bg-white px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Admin Questionnaires</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Simple reusable templates for agreements, letters, consent forms, and onboarding documents.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{counts.total} total</span>
              <span>•</span>
              <span>{counts.active} active</span>
              <span>•</span>
              <span>{counts.archived} archived</span>
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-5 border-b border-border/50">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_220px_220px_auto]">
            <Input
              label="Search"
              placeholder="Search templates..."
              icon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
            <div className="flex items-end">
              <Button
                className="w-full lg:w-auto"
                onClick={() => {
                  setEditingTemplate(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Template</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white">
              {filteredTemplates.map((template) => (
                <tr
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedTemplateId === template.id ? 'bg-primary/5' : 'hover:bg-muted/5'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{template.title}</span>
                        {template.isSystemTemplate ? <Badge variant="secondary">Starter</Badge> : null}
                      </div>
                      <p className="text-muted-foreground">{template.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{CATEGORY_LABELS[template.category]}</td>
                  <td className="px-6 py-4">
                    <Badge variant={template.status === 'active' ? 'success' : 'secondary'}>
                      {template.status === 'active' ? 'Active' : 'Archived'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(template.updatedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(template);
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(template);
                        }}
                      >
                        <FilePenLine className="mr-2 h-3.5 w-3.5" />
                        Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTemplate(template);
                          setIsModalOpen(true);
                        }}
                      >
                        <PencilLine className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveToggle(template);
                        }}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        {template.status === 'active' ? 'Archive' : 'Restore'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No admin questionnaires found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedTemplate ? (
        <Card className="border-none shadow-sm rounded-xl">
          <div className="border-b border-border/50 px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">{selectedTemplate.title}</h3>
              <Badge variant={selectedTemplate.status === 'active' ? 'success' : 'secondary'}>
                {selectedTemplate.status === 'active' ? 'Active' : 'Archived'}
              </Badge>
              <span className="text-sm text-muted-foreground">{CATEGORY_LABELS[selectedTemplate.category]}</span>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="mb-4 text-sm text-muted-foreground">{selectedTemplate.description}</p>
            <div className="whitespace-pre-line rounded-lg border border-border/50 bg-muted/20 p-4 text-sm leading-7 text-foreground/90">
              {selectedTemplate.content}
            </div>
          </div>
        </Card>
      ) : null}

      <AdminQuestionnaireModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSave}
        template={editingTemplate}
      />
    </div>
  );
}
