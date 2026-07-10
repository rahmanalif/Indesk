import React, { useEffect, useState, useMemo } from 'react';
import { Link, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { TimePicker } from '../ui/TimePicker';
import { Textarea } from '../ui/Textarea';
import { useData } from '../../context/DataContext';
import { cn } from '../../lib/utils';
import { notify } from '../ui/ToastHost';
import { useCreateAppointmentMutation, useUpdateAppointmentMutation, useGetClientByIdQuery, useGetClinicMembersQuery, useGetSessionsQuery, useGetClientsQuery, useGetAvailableSlotsQuery, useGetCalendarAppointmentsQuery } from '../../redux/api/clientsApi';
import { useGetIntegrationsQuery } from '../../redux/api/integrationApi';
import type { RootState } from '../../store';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { AvailabilityDaySchedule } from '../../lib/clinicianAvailability';

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
  onAppointmentCreated?: () => void | Promise<unknown>;
  existingData?: any;
  viewSource?: 'day' | 'week' | 'month'; // from Calendar
  fixedClient?: { id: string | number, name: string }; // New Prop for Client Page
  preferredClinicianId?: string;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  onSave,
  onAppointmentCreated,
  existingData,
  viewSource,
  fixedClient,
  preferredClinicianId,
}: CreateAppointmentModalProps) {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { addAppointment, updateAppointment } = useData();
  const [createAppointment] = useCreateAppointmentMutation();
  const [updateAppointmentApi] = useUpdateAppointmentMutation();
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
  useGetClientByIdQuery(selectedClientId as string, {
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
  const { data: clinicMembersResponse, isFetching: isMembersFetching } = useGetClinicMembersQuery(
    { page: 1, limit: 100 },
    { skip: !isOpen, refetchOnMountOrArgChange: true }
  );
  const clinicianOptions = useMemo(() => {
    const members = clinicMembersResponse?.response?.data?.docs || [];
    return members
      .filter((m) => APPOINTMENT_CLINICIAN_ROLES.has(String(m.role || '').toLowerCase()) && m.user)
      .map((m) => ({
        value: String(m.id),
        label: `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim() || m.user?.email || 'Clinician',
        userId: String(m.user?.id || m.userId || ''),
        userEmail: String(m.user?.email || '').toLowerCase().trim(),
      }));
  }, [clinicMembersResponse]);
  const currentUserClinicianOption = useMemo(() => {
    if (!currentUser) return null;
    const userId = String(currentUser.id || '');
    const userEmail = String(currentUser.email || '').toLowerCase().trim();
    if (!userId && !userEmail) return null;

    return clinicianOptions.find((option: any) => {
      return (userId && option.userId === userId) || (userEmail && option.userEmail === userEmail);
    }) || null;
  }, [clinicianOptions, currentUser]);
  const effectiveClinicianId = useMemo(
    () =>
      String(clinicianId || '').trim() ||
      String(currentUserClinicianOption?.value || '').trim() ||
      String(clinicianOptions[0]?.value || '').trim(),
    [clinicianId, currentUserClinicianOption, clinicianOptions],
  );

  const selectedClinicianMember = useMemo(() => {
    const members = clinicMembersResponse?.response?.data?.docs || [];
    return members.find((m: any) => String(m.id) === String(effectiveClinicianId));
  }, [clinicMembersResponse, effectiveClinicianId]);

  const hasNoAvailability = useMemo(() => {
    if (!selectedClinicianMember) return false;
    const schedule = selectedClinicianMember.availabilitySchedule || [];
    return schedule.length === 0;
  }, [selectedClinicianMember]);

  useEffect(() => {
    if (isOpen && hasNoAvailability && !isMembersFetching) {
      notify.warning('This clinician has no availability set up. Please update their availability in settings.');
    }
  }, [isOpen, hasNoAvailability, isMembersFetching, effectiveClinicianId]);

  const dateStr = useMemo(() => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [date]);

  const { data: slotsResponse, isLoading: isSlotsLoading } = useGetAvailableSlotsQuery(
    {
      clinicianId: effectiveClinicianId,
      date: dateStr,
      sessionId: sessionType || undefined,
    },
    {
      skip: !effectiveClinicianId || !dateStr || !isOpen,
      refetchOnMountOrArgChange: true,
    }
  );

  const availableSlots = useMemo(() => {
    return slotsResponse?.response?.data || [];
  }, [slotsResponse]);

  // 24h "HH:MM" start times, derived from the backend slot labels, to show only
  // the available times in the picker instead of the whole day.
  const availableTimeValues = useMemo(() => {
    return (availableSlots as any[])
      .map((slot) => {
        const label = typeof slot?.timeLabel === 'string' ? slot.timeLabel : '';
        const [hm, period] = label.split(' ');
        if (!hm || !period) return null;
        const [hRaw, mRaw] = hm.split(':').map(Number);
        if (Number.isNaN(hRaw) || Number.isNaN(mRaw)) return null;
        let h = hRaw;
        if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
        if (period.toUpperCase() === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:${String(mRaw).padStart(2, '0')}`;
      })
      .filter((value): value is string => Boolean(value));
  }, [availableSlots]);

  const appointmentRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, []);

  const { data: appointmentsResponse } = useGetCalendarAppointmentsQuery(
    {
      clinicianId: effectiveClinicianId,
      startDate: appointmentRange.startDate,
      endDate: appointmentRange.endDate,
    },
    {
      skip: !effectiveClinicianId || !isOpen,
    }
  );

  const appointmentsList = useMemo(() => {
    const raw = appointmentsResponse?.response?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      return (raw as any).docs || (raw as any).events || [];
    }
    return [];
  }, [appointmentsResponse]);

  const getDayWorkingMinutes = (dayName: string) => {
    if (!selectedClinicianMember) return 0;
    const schedule: AvailabilityDaySchedule[] = selectedClinicianMember.availabilitySchedule || [];
    
    let normalized: AvailabilityDaySchedule[] = [];
    if (Array.isArray(schedule) && schedule.length > 0) {
      normalized = schedule;
    }

    const dayAvailability = normalized.find((item) => item.day?.toLowerCase() === dayName.toLowerCase());
    if (!dayAvailability) return 0;

    const [startH, startM] = (dayAvailability.startTime || "09:00").split(':').map(Number);
    const [endH, endM] = (dayAvailability.endTime || "17:00").split(':').map(Number);
    let totalMin = (endH * 60 + endM) - (startH * 60 + startM);

    if (dayAvailability.breakTime?.startTime && dayAvailability.breakTime?.endTime) {
      const [breakStartH, breakStartM] = dayAvailability.breakTime.startTime.split(':').map(Number);
      const [breakEndH, breakEndM] = dayAvailability.breakTime.endTime.split(':').map(Number);
      const breakMin = (breakEndH * 60 + breakEndM) - (breakStartH * 60 + breakStartM);
      totalMin -= breakMin;
    }
    return totalMin;
  };

  const isDateDisabled = (d: Date) => {
    if (!selectedClinicianMember) return false;
    const tz = (selectedClinicianMember.user as any)?.timezone || 'Europe/London';
    const dayName = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "long"
    }).format(d).toLowerCase();

    const schedule: AvailabilityDaySchedule[] = selectedClinicianMember.availabilitySchedule || [];

    const workingDays = Array.isArray(schedule) && schedule.length > 0
      ? schedule.map((item) => item?.day?.toLowerCase())
      : [];

    if (!workingDays.includes(dayName)) {
      return true; // Not a working day
    }

    const dateStrInTz = formatInTimeZone(d, tz, 'yyyy-MM-dd');
    const appointmentsOnDay = appointmentsList.filter((app: any) => {
      if (app.status === 'cancelled') return false;
      const appStart = app.startTime || app.start;
      if (!appStart) return false;
      
      const appDateStr = formatInTimeZone(new Date(appStart), tz, 'yyyy-MM-dd');
      return appDateStr === dateStrInTz;
    });

    const totalScheduledMin = appointmentsOnDay.reduce((sum: number, app: any) => {
      const duration = Number(app.duration) || 50;
      return sum + duration;
    }, 0);

    const workingMinutes = getDayWorkingMinutes(dayName);
    return totalScheduledMin >= workingMinutes;
  };

  const isTimeDisabled = (time24: string) => {
    // No date/clinician yet: nothing is bookable, so disable every time (pick a date first).
    if (!date || !effectiveClinicianId) return true;
    if (isSlotsLoading) return false;
    if (availableSlots.length === 0) return true;

    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    const label12h = `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;

    return !availableSlots.some((slot: any) => slot.timeLabel === label12h);
  };

  useEffect(() => {
    if (date && isDateDisabled(date)) {
      setDate(undefined);
      setTime('');
    }
  }, [effectiveClinicianId]);

  useEffect(() => {
    if (time && isTimeDisabled(time)) {
      setTime('');
    }
  }, [availableSlots]);

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
        setClinicianId(String(preferredClinicianId || ''));
        setMeetingType('in_person');
      } else {
        setClientNameInput('');
        setSelectedClientId(undefined);
        setSessionType(defaultSessionId);
        setClinicianId(String(preferredClinicianId || ''));
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
  }, [isOpen, initialDate, initialTime, existingData, viewSource, fixedClient, preferredClinicianId, sessionTypes]);

  useEffect(() => {
    if (!isOpen) return;
    if (clinicianOptions.length === 0) return;

    if (clinicianId && clinicianOptions.some((option) => option.value === String(clinicianId))) {
      return;
    }

    const preferredMatch = preferredClinicianId
      ? clinicianOptions.find((option) => option.value === String(preferredClinicianId))
      : null;

    setClinicianId(
      preferredMatch?.value ||
      currentUserClinicianOption?.value ||
      clinicianOptions[0].value
    );
  }, [
    isOpen,
    clinicianOptions,
    preferredClinicianId,
    currentUserClinicianOption,
    clinicianId,
  ]);

  // Filter clients for autocomplete
  const filteredClients = useMemo(() => {
    if (!clientNameInput) return [];
    const lower = clientNameInput.toLowerCase();
    return apiClients.filter((c: any) => c.name.toLowerCase().includes(lower));
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

    const selectedSessionData = sessionTypes.find(s => s.id.toString() === sessionType);
    if (!selectedSessionData) {
      alert('Selected session type is invalid. Please re-select a session.');
      return;
    }
    if (!selectedSessionData.name || selectedSessionData.duration == null) {
      alert('Selected session data is incomplete. Please re-select a session type.');
      return;
    }

    const selectedClient = apiClients.find((c: any) => String(c.id) === String(selectedClientId));
    if (!selectedClient) {
      alert('Selected client is not available in this clinic. Please re-select a client.');
      return;
    }

    setIsLoading(true);

    const resolvedClinicianId = effectiveClinicianId;
    const clinicianIdToSend = resolvedClinicianId || null;

    if (!clinicianIdToSend) {
      alert('No clinician is available in this clinic. Please add/select a clinician first.');
      setIsLoading(false);
      return;
    }

    const members = clinicMembersResponse?.response?.data?.docs || [];
    const selectedClinicianMember = members.find((m: any) => String(m.id) === String(clinicianIdToSend));
    const clinicianTimezone = (selectedClinicianMember?.user as any)?.timezone || 'Europe/London';

    const targetDate = date || new Date();
    const timeStr = time || '09:00';
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const localDateTimeStr = `${year}-${month}-${day} ${timeStr}:00`;

    const clinicianDateTime = fromZonedTime(localDateTimeStr, clinicianTimezone);
    const dateIso = clinicianDateTime.toISOString();
    const timeIso = clinicianDateTime.toISOString();
    const dateStr = targetDate.toISOString().split('T')[0];

    if (requiresMeetingIntegration && !isSelectedMeetingConnected) {
      alert(`Please connect ${selectedMeetingProviderName} in Integrations before scheduling this meeting type.`);
      setIsLoading(false);
      return;
    }

    const selectedClinician = clinicianOptions.find(o => o.value === clinicianIdToSend);
    if (!selectedClinician) {
      alert('Selected clinician is invalid for this clinic. Please re-select a clinician.');
      setIsLoading(false);
      return;
    }
    const appointmentData = {
      id: existingData?.id,
      clientName: clientNameInput,
      clientId: selectedClientId,
      clinician: selectedClinician.label,
      clinicianId: clinicianIdToSend,
      date: dateStr,
      time: timeStr,
      duration: selectedSessionData.duration,
      type: selectedSessionData.name,
      meetingType,
      notes,
      color: selectedSessionData.color,
      status: existingData?.status,
      videoLink: existingData?.videoLink,
    };

    const payload = {
      sessionId: sessionType,
      clientId: selectedClientId.toString(),
      clinicianId: clinicianIdToSend,
      date: dateIso,
      time: timeIso,
      note: notes || null,
      meetingType,
    };

    const action = existingData?.id 
      ? updateAppointmentApi({ id: existingData.id, ...payload })
      : createAppointment(payload);

    action
      .unwrap()
      .then(async () => {
        await onAppointmentCreated?.();
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
                    {filteredClients.map((client: any) => (
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
              value={effectiveClinicianId}
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
            <DatePicker label="Date" date={date} setDate={setDate} isDateDisabled={isDateDisabled} />
            <TimePicker label="Start Time" time={time} setTime={setTime} availableTimes={availableTimeValues} />
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
