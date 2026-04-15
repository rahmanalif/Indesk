import React, { useState } from 'react';
import { Link, MessageSquare, Mail, PoundSterling } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
import { useCreateSessionMutation } from '../../redux/api/clientsApi';
import { useGetIntegrationsQuery } from '../../redux/api/integrationApi';
import { useNavigate } from 'react-router-dom';

const normalizeIntegrationKey = (value?: string) => {
  if (!value) return '';
  const normalized = value.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (normalized === 'mail_chimp' || normalized === 'mailchimp_marketing' || normalized === 'mail_chimp_marketing') {
    return 'mailchimp';
  }
  if (normalized === 'twilo') {
    return 'twilio';
  }
  return normalized;
};

const isConnectedIntegration = (integration: any) => {
  const normalizedStatus = String(integration?.status || '').toLowerCase();
  return normalizedStatus === 'connected' || integration?.isConnected === true;
};
interface CreateSessionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSessionTypeModal({
  isOpen,
  onClose
}: CreateSessionTypeModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [createSession] = useCreateSessionMutation();
  const { data: integrationsResponse } = useGetIntegrationsQuery();
  const [sessionName, setSessionName] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('150.00');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [description, setDescription] = useState('');
  const [emailReminder, setEmailReminder] = useState(true);
  const [smsReminder, setSmsReminder] = useState(false);

  const integrationListRaw = integrationsResponse?.response?.data;
  const integrationList = Array.isArray(integrationListRaw) ? integrationListRaw : integrationListRaw?.docs || [];
  const mailchimpIntegration = integrationList.find((integration: any) => {
    const typeKey = normalizeIntegrationKey(integration?.type);
    const nameKey = normalizeIntegrationKey(integration?.name);
    return typeKey === 'mailchimp' || nameKey === 'mailchimp';
  });
  const twilioIntegration = integrationList.find((integration: any) => {
    const typeKey = normalizeIntegrationKey(integration?.type);
    const nameKey = normalizeIntegrationKey(integration?.name);
    return typeKey === 'twilio' || nameKey === 'twilio';
  });

  const isMailchimpConnected = isConnectedIntegration(mailchimpIntegration);
  const isTwilioConnected = isConnectedIntegration(twilioIntegration);
  const selectedReminders = [
    emailReminder && isMailchimpConnected ? 'Email' : null,
    smsReminder && isTwilioConnected ? 'SMS' : null,
  ].filter(Boolean) as string[];

  const handleConnectIntegration = () => {
    onClose();
    navigate('/integrations');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const durationValue = Number(duration);
    const priceValue = Number(price);

    createSession({
      name: sessionName,
      description: description || null,
      duration: Number.isFinite(durationValue) ? durationValue : 0,
      price: Number.isFinite(priceValue) ? priceValue : 0,
      reminders: selectedReminders.length ? selectedReminders : null,
    })
      .unwrap()
      .then(() => {
        onClose();
        setSessionName('');
        setDuration('60');
        setPrice('150.00');
        setSelectedColor('blue');
        setDescription('');
        setEmailReminder(true);
        setSmsReminder(false);
      })
      .catch(() => {
        alert('Failed to create session type. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Create Session Type" description="Define a new service offering">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Session Name"
          placeholder="e.g. Initial Consultation"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className="h-11 rounded-xl"
          required
        />
        <Input
          label="Duration (minutes)"
          type="number"
          placeholder="60"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="h-11 rounded-xl"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          placeholder="150.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-11 rounded-xl"
          icon={<PoundSterling className="h-4 w-4" />}
          required
        />
        <Select
          label="Color Code"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          triggerClassName="h-11 rounded-xl"
          options={[
            { value: 'blue', label: 'Blue', color: '#3b82f6' },
            { value: 'green', label: 'Green', color: '#22c55e' },
            { value: 'purple', label: 'Purple', color: '#a855f7' },
            { value: 'orange', label: 'Orange', color: '#f97316' },
            { value: 'rose', label: 'Rose', color: '#f43f5e' },
            { value: 'amber', label: 'Amber', color: '#f59e0b' }
          ]}
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">Reminders</label>
        <div className="grid gap-3 pt-1">
          <div className="rounded-xl border border-border/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Email Reminder</span>
                </div>
                {/* <p className="text-sm text-muted-foreground">
                  Uses {mailchimpIntegration?.name || 'Mailchimp'} for email reminder delivery.
                </p> */}
                {/* <p className={`text-xs font-medium ${isMailchimpConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isMailchimpConnected ? `${mailchimpIntegration?.name || 'Mailchimp'} connected` : 'Mailchimp not connected'}
                </p> */}
              </div>
              <Checkbox
                checked={emailReminder && isMailchimpConnected}
                onCheckedChange={setEmailReminder}
                disabled={!isMailchimpConnected}
              />
            </div>

            {!isMailchimpConnected && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <span>Connect Mailchimp to enable email reminders.</span>
                <Button type="button" variant="outline" size="sm" onClick={handleConnectIntegration}>
                  <Link className="mr-2 h-3.5 w-3.5" />
                  Connect
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">SMS Reminder</span>
                </div>
                {/* <p className="text-sm text-muted-foreground">
                  Uses {twilioIntegration?.name || 'Twilio'} for SMS reminder delivery.
                </p>
                <p className={`text-xs font-medium ${isTwilioConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isTwilioConnected ? `${twilioIntegration?.name || 'Twilio'} connected` : 'Twilio not connected'}
                </p> */}
              </div>
              <Checkbox
                checked={smsReminder && isTwilioConnected}
                onCheckedChange={setSmsReminder}
                disabled={!isTwilioConnected}
              />
            </div>

            {!isTwilioConnected && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <span>Connect Twilio to enable SMS reminders.</span>
                <Button type="button" variant="outline" size="sm" onClick={handleConnectIntegration}>
                  <Link className="mr-2 h-3.5 w-3.5" />
                  Connect
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Textarea
        label="Description"
        placeholder="What does this session include?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-xl min-h-[100px]"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-xl px-6">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} className="h-11 rounded-xl px-6">
          Create Session Type
        </Button>
      </div>
    </form>
  </Modal>;
}
