import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

export type AdminQuestionnaireCategory =
  | 'agreement'
  | 'consent'
  | 'intake'
  | 'feedback'
  | 'letter'
  | 'admin';

export type AdminQuestionnaireTemplate = {
  id: string;
  title: string;
  category: AdminQuestionnaireCategory;
  description: string;
  content: string;
  status: 'active' | 'archived';
  updatedAt: string;
  isSystemTemplate?: boolean;
};

type AdminQuestionnaireDraft = Omit<AdminQuestionnaireTemplate, 'id' | 'updatedAt'>;

interface AdminQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: AdminQuestionnaireDraft) => void;
  template?: AdminQuestionnaireTemplate | null;
}

const categoryOptions = [
  { value: 'agreement', label: 'Agreement' },
  { value: 'consent', label: 'Consent' },
  { value: 'intake', label: 'Intake' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'letter', label: 'Letter' },
  { value: 'admin', label: 'Admin' },
];

const initialDraft: AdminQuestionnaireDraft = {
  title: '',
  category: 'admin',
  description: '',
  content: '',
  status: 'active',
  isSystemTemplate: false,
};

export function AdminQuestionnaireModal({
  isOpen,
  onClose,
  onSave,
  template,
}: AdminQuestionnaireModalProps) {
  const [draft, setDraft] = useState<AdminQuestionnaireDraft>(initialDraft);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (template) {
      setDraft({
        title: template.title,
        category: template.category,
        description: template.description,
        content: template.content,
        status: template.status,
        isSystemTemplate: template.isSystemTemplate ?? false,
      });
      return;
    }

    setDraft(initialDraft);
  }, [isOpen, template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      onSave({
        ...draft,
        title: draft.title.trim(),
        description: draft.description.trim(),
        content: draft.content.trim(),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Edit Admin Questionnaire' : 'Create Admin Questionnaire'}
      description="Keep this lightweight for now: title, summary, and document-style content."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Template Title"
            placeholder="Associate Licence Agreement"
            value={draft.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <Select
            label="Category"
            value={draft.category}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                category: e.target.value as AdminQuestionnaireCategory,
              }))
            }
            options={categoryOptions}
          />
        </div>

        <Input
          label="Short Description"
          placeholder="Reusable onboarding agreement for new associate clinicians."
          value={draft.description}
          onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
        />

        <Textarea
          label="Template Content"
          placeholder="Write or paste the template content here. Example: Dear [ASSOCIATE NAME]..."
          value={draft.content}
          onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
          className="min-h-[360px]"
          required
        />

        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
          Suggested placeholders: `[CLIENT NAME]`, `[CLINIC NAME]`, `[DATE]`, `[ASSOCIATE NAME]`, `[DIRECTOR NAME]`
        </div>

        <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={!draft.title.trim() || !draft.content.trim()}>
            Save Template
          </Button>
        </div>
      </form>
    </Modal>
  );
}
