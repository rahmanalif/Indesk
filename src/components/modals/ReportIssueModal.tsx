import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useContactProviderIssueMutation } from '../../redux/api/clientsApi';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId?: string;
}

interface ReportIssueFormErrors {
  subject: string;
  message: string;
}

const initialErrors: ReportIssueFormErrors = {
  subject: '',
  message: '',
};

export function ReportIssueModal({ isOpen, onClose, clinicId }: ReportIssueModalProps) {
  const [contactProviderIssue, { isLoading }] = useContactProviderIssueMutation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<ReportIssueFormErrors>(initialErrors);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSubject('');
      setMessage('');
      setErrors(initialErrors);
      setSubmitError('');
      setSubmitSuccess('');
    }
  }, [isOpen]);

  const trimmedSubject = useMemo(() => subject.trim(), [subject]);
  const trimmedMessage = useMemo(() => message.trim(), [message]);

  const validate = () => {
    const nextErrors: ReportIssueFormErrors = { subject: '', message: '' };

    if (!trimmedSubject) {
      nextErrors.subject = 'Subject is required.';
    } else if (trimmedSubject.length < 5) {
      nextErrors.subject = 'Subject must be at least 5 characters.';
    } else if (trimmedSubject.length > 200) {
      nextErrors.subject = 'Subject must be 200 characters or fewer.';
    }

    if (!trimmedMessage) {
      nextErrors.message = 'Message is required.';
    } else if (trimmedMessage.length < 10) {
      nextErrors.message = 'Message must be at least 10 characters.';
    } else if (trimmedMessage.length > 2000) {
      nextErrors.message = 'Message must be 2000 characters or fewer.';
    }

    setErrors(nextErrors);
    return !nextErrors.subject && !nextErrors.message;
  };

  const handleClose = () => {
    if (isLoading) {
      return;
    }
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitError('');
      setSubmitSuccess('');

      const response = await contactProviderIssue({
        subject: trimmedSubject,
        message: trimmedMessage,
        clinicId,
      }).unwrap();

      setSubmitSuccess(response.message || 'Your report has been sent.');
      setSubject('');
      setMessage('');
      setErrors(initialErrors);
    } catch (error: any) {
      const fieldErrors = error?.data?.errors;

      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors((prev) => ({
          ...prev,
          subject: fieldErrors.subject || prev.subject,
          message: fieldErrors.message || prev.message,
        }));
      }

      setSubmitError(error?.data?.message || error?.message || 'Failed to send your report.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report An Issue"
      description="Send a message to the platform provider."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject"
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value);
            if (errors.subject) {
              setErrors((prev) => ({ ...prev, subject: '' }));
            }
            if (submitError) {
              setSubmitError('');
            }
            if (submitSuccess) {
              setSubmitSuccess('');
            }
          }}
          placeholder="Unable to update subscription"
          maxLength={200}
          error={errors.subject}
          disabled={isLoading}
        />

        <Textarea
          label="Message"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (errors.message) {
              setErrors((prev) => ({ ...prev, message: '' }));
            }
            if (submitError) {
              setSubmitError('');
            }
            if (submitSuccess) {
              setSubmitSuccess('');
            }
          }}
          placeholder="Describe the issue you are seeing."
          className="min-h-32"
          maxLength={2000}
          error={errors.message}
          disabled={isLoading}
        />

        {submitError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </p>
        )}

        {submitSuccess && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {submitSuccess}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </Modal>
  );
}
