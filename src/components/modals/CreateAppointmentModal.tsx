import React, { useEffect, useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { TimePicker } from '../ui/TimePicker';
import { Textarea } from '../ui/Textarea';
import { useData } from '../../context/DataContext';
import { cn } from '../../lib/utils';

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
  const { clients, addAppointment, updateAppointment, sessionTypes } = useData();
  const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
  const [time, setTime] = useState(initialTime || '');
  const [clientNameInput, setClientNameInput] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | number | undefined>(undefined);
  const [clinicianId, setClinicianId] = useState(existingData?.clinicianId?.toString() || '1');
  const [sessionType, setSessionType] = useState(existingData ? sessionTypes.find(t => t.name === existingData.type)?.id.toString() || '1' : sessionTypes[0]?.id.toString() || '1');
  const [notes, setNotes] = useState('');
  const [suggestionBoxOpen, setSuggestionBoxOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Sync state with props when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (existingData) {
        setDate(new Date(existingData.date));
        setTime(existingData.time);
        setClientNameInput(existingData.clientName);
        setSelectedClientId(existingData.clientId || 999);
        const matchedType = sessionTypes.find(t => t.name === existingData.type);
        setSessionType(matchedType ? matchedType.id.toString() : (sessionTypes[0]?.id.toString()));
        setClinicianId(existingData.clinicianId?.toString() || '1');
        setNotes(existingData.notes || '');
      } else if (fixedClient) {
        setClientNameInput(fixedClient.name);
        setSelectedClientId(fixedClient.id);
        setDate(initialDate || new Date());
        setTime(initialTime || '');
        setNotes('');
        setSessionType(sessionTypes[0]?.id.toString());
        setClinicianId('1');
      } else {
        setClientNameInput('');
        setSelectedClientId(undefined);
        setSessionType(sessionTypes[0]?.id.toString());
        setClinicianId('1');
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
  }, [isOpen, initialDate, initialTime, existingData, viewSource, fixedClient]);

  // Filter clients for autocomplete
  const filteredClients = useMemo(() => {
    if (!clientNameInput) return [];
    const lower = clientNameInput.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(lower));
  }, [clientNameInput, clients]);

  const handleClientSelect = (client: typeof clients[0]) => {
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
    return clients.some(c => c.name.toLowerCase() === clientNameInput.trim().toLowerCase());
  }, [clientNameInput, fixedClient, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClientValid) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const selectedSessionData = sessionTypes.find(s => s.id.toString() === sessionType);

      const appointmentData = {
        id: existingData?.id,
        clientName: clientNameInput,
        clientId: selectedClientId,
        clinician: clinicianId === '1' ? 'Dr. Sarah Wilson' : 'Dr. John Doe',
        clinicianId: parseInt(clinicianId),
        date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: time || '09:00',
        duration: parseInt(selectedSessionData?.duration || '50'),
        type: selectedSessionData?.name || 'Therapy Session',
        notes,
        color: selectedSessionData?.color || 'bg-blue-100 border-blue-200 text-blue-700',
        status: existingData?.status || 'Active',
        videoLink: existingData?.videoLink || 'https://zoom.us/j/123456789'
      };

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
    }, 600);
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
              onChange={(e) => setClinicianId(e.target.value)}
              options={[
                { value: '1', label: 'Dr. Sarah Wilson' },
                { value: '2', label: 'Dr. John Doe' }
              ]}
            />

            <Select
              label="Session Type"
              options={sessionTypes.map(s => ({ value: s.id.toString(), label: s.name + ' (' + s.duration + ')' }))}
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            <DatePicker label="Date" date={date} setDate={setDate} />
            <TimePicker label="Start Time" time={time} setTime={setTime} />
          </div>
        </div>

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
          <Button type="submit" isLoading={isLoading} disabled={!isClientValid || !clientNameInput}>
            {existingData ? 'Save Changes' : 'Schedule Appointment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
