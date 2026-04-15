import React, { useEffect, useState, useMemo } from 'react';
import { Link, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { TimePicker } from '../ui/TimePicker';
import { Textarea } from '../ui/Textarea';
import { useData } from '../../context/DataContext';
import { cn } from '../../lib/utils';
import { useCreateAppointmentMutation, useGetClientByIdQuery, useGetClinicMembersQuery, useGetSessionsQuery, useGetClientsQuery } from '../../redux/api/clientsApi';
import { useGetIntegrationsQuery } from '../../redux/api/integrationApi';

const APPOINTMENT_CLINICIAN_ROLES = new Set(['clinician', 'superadmin', 'admin']);

const normalizeIntegrationKey = (value?: string) => {
  if (!value) return '';
  const normalized = value.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (normalized === 'googlemeet') return 'google_meet';
  if (normalized === 'google') return 'google_meet';
  return normalized;
};

const isConnectedIntegration = (integration: any) => {
  const normalizedStatus = String(integration?.status || '').toLowerCase();
  return normalizedStatus === 'connected' || integration?.isConnected === true;
};

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialTime?: string;
  onSave?: (data: any) => void;
  existingData?: any;
  viewSource?: 'day' | 'week' | 'month'; // from Calendar
  fixedClient?: { id: string | number, name: string }; // New Prop for Client Page
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  onSave,
  existingData,
  viewSource,
  fixedClient
}: CreateAppointmentModalProps) {
  const navigate = useNavigate();
  const { addAppointment, updateAppointment } = useData();
  const [createAppointment] = useCreateAppointmentMutation();
  const { data: integrationsResponse } = useGetIntegrationsQuery(undefined, {
    skip: !isOpen,
  });
  const { data: clientsResponse } = useGetClientsQuery(
    { page: 1, limit: 100 },
    { skip: !isOpen }
  );
  const { data: sessionsResponse, isLoading: isSessionsLoading } = useGetSessionsQuery(undefined, {
    skip: !isOpen
  });
  const sessionTypes = sessionsResponse?.response?.data?.docs || [];
  const sessionOptions = useMemo(() => {
    if (isSessionsLoading) return [{ value: '', label: 'Loading session types...' }];
    if (sessionTypes.length === 0) return [{ value: '', label: 'No session types available' }];
    return sessionTypes.map(s => ({ value: s.id.toString(), label: `${s.name} (${s.duration} min)` }));
  }, [isSessionsLoading, sessionTypes]);
  const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
  const [time, setTime] = useState(initialTime || '');
  const [clientNameInput, setClientNameInput] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | number | undefined>(undefined);
  const [clinicianId, setClinicianId] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [meetingType, setMeetingType] = useState<'in_person' | 'zoom' | 'google_meet'>('in_person');
  const [notes, setNotes] = useState('');
  const [suggestionBoxOpen, setSuggestionBoxOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const isGuid = (val: unknown) =>
    typeof val === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
  const shouldFetchClient = isGuid(selectedClientId);
  const { data: clientDetails } = useGetClientByIdQuery(selectedClientId as string, {
    skip: !shouldFetchClient,
  });
  const apiClients = useMemo(() => {
    const docs = clientsResponse?.response?.data?.docs || [];
    return docs.map((c: any) => ({
      id: c.id,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Client',
      email: c.email || '',
    }));
  }, [clientsResponse]);
  const { data: clinicMembersResponse } = useGetClinicMembersQuery(
    { page: 1, limit: 100 },
    { skip: !isOpen }
  );
  const clinicianOptions = useMemo(() => {
    const members = clinicMembersResponse?.response?.data?.docs || [];
    return members
      .filter((m) => APPOINTMENT_CLINICIAN_ROLES.has(String(m.role || '').toLowerCase()) && m.user)
      .map((m, idx) => ({
        value: m.id,
        label: `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim() || m.user?.email || 'Clinician',
      }));
  }, [clinicMembersResponse]);
  const integrationsRaw = integrationsResponse?.response?.data;
  const integrations = Array.isArray(integrationsRaw) ? integrationsRaw : integrationsRaw?.docs || [];
  const zoomIntegration = integrations.find((integration: any) => {
    const typeKey = normalizeIntegrationKey(integration?.type);
    const nameKey = normalizeIntegrationKey(integration?.name);
    return typeKey === 'zoom' || nameKey === 'zoom';
  });
  const googleMeetIntegration = integrations.find((integration: any) => {
    const typeKey = normalizeIntegrationKey(integration?.type);
    const nameKey = normalizeIntegrationKey(integration?.name);
    return typeKey === 'google_meet' || nameKey === 'google_meet';
  });
  const isZoomConnected = isConnectedIntegration(zoomIntegration);
  const isGoogleMeetConnected = isConnectedIntegration(googleMeetIntegration);
  const requiresMeetingIntegration = meetingType === 'zoom' || meetingType === 'google_meet';
  const isSelectedMeetingConnected =
    meetingType === 'zoom'
      ? isZoomConnected
      : meetingType === 'google_meet'
        ? isGoogleMeetConnected
        : true;
  const selectedMeetingProviderName =
    meetingType === 'zoom'
      ? zoomIntegration?.name || 'Zoom'
      : meetingType === 'google_meet'
        ? googleMeetIntegration?.name || 'Google Meet'
        : null;

  // Sync state with props when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const defaultSessionId = sessionTypes[0]?.id?.toString() || '';

      if (existingData) {
        setDate(new Date(existingData.date));
        setTime(existingData.time);
        setClientNameInput(existingData.clientName);
        setSelectedClientId(existingData.clientId || 999);
        const matchedType = sessionTypes.find(t => t.name === existingData.type);
        setSessionType(matchedType ? matchedType.id.toString() : defaultSessionId);
        setClinicianId(existingData.clinicianId?.toString() || '');
        setMeetingType(existingData.meetingType || 'in_person');
        setNotes(existingData.notes || '');
      } else if (fixedClient) {
        setClientNameInput(fixedClient.name);
        setSelectedClientId(fixedClient.id);
        setDate(initialDate || new Date());
        setTime(initialTime || '');
        setNotes('');
        setSessionType(defaultSessionId);
        setClinicianId('');
        setMeetingType('in_person');
      } else {
        setClientNameInput('');
        setSelectedClientId(undefined);
        setSessionType(defaultSessionId);
        setClinicianId('');
        setMeetingType('in_person');
        setNotes('');

        if (viewSource === 'day') {
          setTime(initialTime || '');
          setDate(undefined);
        } else if (viewSource === 'week') {
          setTime(initialTime || '');
          setDate(initialDate);
        } else if (viewSource === 'month') {
          setTime('');
          setDate(initialDate);
        } else {
          setDate(undefined);
          setTime('');
        }
      }
    }
  }, [isOpen, initialDate, initialTime, existingData, viewSource, fixedClient, sessionTypes]);

  useEffect(() => {
    if (!isOpen) return;
    if (clinicianOptions.length === 0) return;
    const assignedClinicianId = clientDetails?.response?.data?.assignedClinicianId;
    const preferredId = assignedClinicianId || clinicianId;
    const match = clinicianOptions.find(o => o.value === preferredId) || clinicianOptions[0];
    setClinicianId(match.value);
  }, [isOpen, clinicianOptions, clientDetails, clinicianId]);

  // Filter clients for autocomplete
  const filteredClients = useMemo(() => {
    if (!clientNameInput) return [];
    const lower = clientNameInput.toLowerCase();
    return apiClients.filter(c => c.name.toLowerCase().includes(lower));
  }, [clientNameInput, apiClients]);

  const handleClientSelect = (client: { id: string; name: string; email: string }) => {
    setClientNameInput(client.name);
    setSelectedClientId(client.id);
    setSuggestionBoxOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientNameInput(e.target.value);
    setSelectedClientId(undefined);
    setSuggestionBoxOpen(true);
  };

  const isClientValid = useMemo(() => {
    if (fixedClient) return true;
    return isGuid(selectedClientId);
  }, [fixedClient, selectedClientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClientValid) return;
    if (sessionTypes.length === 0) {
      alert('No session types available.');
      return;
    }
    if (!selectedClientId) {
      alert('Please select a client.');
      return;
    }

    setIsLoading(true);

    const selectedSessionData = sessionTypes.find(s => s.id.toString() === sessionType);
    const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const timeStr = time || '09:00';
    const dateIso = new Date(`${dateStr}T00:00:00.000Z`).toISOString();
    const timeIso = new Date(`${dateStr}T${timeStr}:00.000Z`).toISOString();

    const clinicianIdToSend = isGuid(clinicianId)
      ? clinicianId
      : clientDetails?.response?.data?.assignedClinicianId || null;

    if (!clinicianIdToSend) {
      alert('Clinician is missing. Please select a valid client or clinician.');
      setIsLoading(false);
      return;
    }

    if (requiresMeetingIntegration && !isSelectedMeetingConnected) {
      alert(`Please connect ${selectedMeetingProviderName} in Integrations before scheduling this meeting type.`);
      setIsLoading(false);
      return;
    }

    const selectedClinician = clinicianOptions.find(o => o.value === clinicianId);
    const appointmentData = {
      id: existingData?.id,
      clientName: clientNameInput,
      clientId: selectedClientId,
      clinician: selectedClinician?.label || 'Clinician',
      clinicianId: clinicianIdToSend,
      date: dateStr,
      time: timeStr,
      duration: selectedSessionData?.duration ?? 50,
      type: selectedSessionData?.name || 'Therapy Session',
      meetingType,
      notes,
      color: selectedSessionData?.color || 'bg-blue-100 border-blue-200 text-blue-700',
      status: existingData?.status || 'Active',
      videoLink: existingData?.videoLink || 'https://zoom.us/j/123456789'
    };

    createAppointment({
      sessionId: sessionType,
      clientId: selectedClientId.toString(),
      clinicianId: clinicianIdToSend,
      date: dateIso,
      time: timeIso,
      note: notes || null,
      meetingType,
    })
      .unwrap()
      .then(() => {
        if (onSave) {
          onSave(appointmentData);
        } else {
          if (existingData) {
            updateAppointment(appointmentData);
          } else {
            addAppointment(appointmentData);
          }
          onClose();
        }
      })
      .catch((error: any) => {
        const backendMessage =
          error?.data?.message ||
          error?.error ||
          'Failed to create appointment. Please try again.';
        alert(backendMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingData ? "Edit Appointment" : "New Appointment"}>
      <form onSubmit={handleSubmit} className="space-y-8 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Client Autocomplete */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">Client Name <span className="text-red-500">*</span></label>
              <Input
                value={clientNameInput}
                onChange={handleInputChange}
                onFocus={() => !fixedClient && setSuggestionBoxOpen(true)}
                placeholder="Search Client..."
                disabled={!!fixedClient}
                className={cn("h-14 rounded-2xl", fixedClient ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-secondary/30")}
                error={!isClientValid && clientNameInput ? "Client not found" : undefined}
              />
              {suggestionBoxOpen && filteredClients.length > 0 && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSuggestionBoxOpen(false)} />
                  <div className="absolute top-full left-0 right-0 z-50 bg-white/95 backdrop-blur-md border border-primary/10 rounded-2xl shadow-xl mt-2 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {filteredClients.map(client => (
                      <div
                        key={client.id}
                        className="px-4 py-3 hover:bg-primary/5 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-0"
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="font-bold text-slate-800">{client.name}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-medium">{client.email}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Select
              label="Clinician"
              value={clinicianId}
              onChange={(e) => {
                const nextId = e.target.value;
                setClinicianId(nextId);
              }}
              options={clinicianOptions.length > 0 ? clinicianOptions.map(o => ({
                value: o.value,
                label: o.label
              })) : [{ value: '', label: 'No clinicians available' }]}
            />

            <Select
              label="Session Type"
              options={sessionOptions}
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              disabled={isSessionsLoading || sessionTypes.length === 0}
            />
          </div>

          <div className="space-y-6">
            <DatePicker label="Date" date={date} setDate={setDate} />
            <TimePicker label="Start Time" time={time} setTime={setTime} />
            <Select
              label="Meeting Type"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value as 'in_person' | 'zoom' | 'google_meet')}
              options={[
                { value: 'in_person', label: 'In Person' },
                { value: 'zoom', label: 'Zoom' },
                { value: 'google_meet', label: 'Google Meet' },
              ]}
            />
          </div>
        </div>

        {requiresMeetingIntegration && (
          <div className={`rounded-2xl border px-4 py-4 text-sm ${isSelectedMeetingConnected ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Video className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">
                    {isSelectedMeetingConnected
                      ? `${selectedMeetingProviderName} is connected and ready for this meeting type.`
                      : `${selectedMeetingProviderName} is not connected yet.`}
                  </p>
                  {!isSelectedMeetingConnected && (
                    <p className="text-xs sm:text-sm">
                      Connect {selectedMeetingProviderName} in Integrations to enable this video session type.
                    </p>
                  )}
                </div>
              </div>

              {!isSelectedMeetingConnected && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    onClose();
                    navigate('/integrations');
                  }}
                >
                  <Link className="mr-2 h-3.5 w-3.5" />
                  Connect
                </Button>
              )}
            </div>
          </div>
        )}

        <Textarea
          label="Notes"
          placeholder="Add any internal notes for this session..."
          className="h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!isClientValid || !clientNameInput || (requiresMeetingIntegration && !isSelectedMeetingConnected)}>
            {existingData ? 'Save Changes' : 'Schedule Appointment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
