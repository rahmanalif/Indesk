import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Download, Edit2, Plus, Trash2, Loader2, Calendar, Clock, ChevronDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { 
  useGetClientsQuery, 
  useGetAppointmentsQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  Client,
  Appointment
} from '../../redux/api/invoiceApi';
import { useGetClinicQuery } from '../../redux/api/clientsApi';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  appointmentId?: string; // Link item to appointment
}

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (invoice: any) => void;
  invoice?: any; // If null, creating new
  mode?: 'view' | 'edit';
  fixedClientId?: string;
}

const formatInvoiceCurrency = (value: number) => `£${Number(value || 0).toFixed(2)}`;

const validDateOr = (value: unknown, fallback: Date) => {
  if (!value) return fallback;
  const date = value instanceof Date
    ? new Date(value.getTime())
    : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? fallback : date;
};

export function InvoicePreviewModal({ isOpen, onClose, onSave, invoice, mode = 'view', fixedClientId }: InvoicePreviewModalProps) {
  const { branding } = useData();
  const { data: clinicResponse } = useGetClinicQuery();
  const clinic = clinicResponse?.response?.data;
  const apiOrigin = (() => {
    try {
      return new URL(import.meta.env.VITE_API_BASE_URL).origin;
    } catch {
      return '';
    }
  })();
  const resolveImageUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    if (!apiOrigin) return value;
    if (value.startsWith('/uploads/')) return `${apiOrigin}/public${value}`;
    return `${apiOrigin}${value}`;
  };
  const clinicLogo = resolveImageUrl(clinic?.logo) || resolveImageUrl(branding.logo);
  const clinicName = clinic?.name || 'Inkind Wellness';
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  
  // Client state
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Invoice state
  const [items, setItems] = useState<InvoiceItem[]>([
   // { id: '1', description: 'Therapy Session - 60 min', quantity: 1, unitPrice: 150.00, total: 150.00 }
  ]);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<string[]>([]);
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<'draft' | 'pending' | 'sent' | 'paid' | 'overdue'>('draft');
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);

  // RTK Query hooks
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({
    page: 1,
    limit: 50,
    status: 'active'
  });

  // Fetch appointments for selected client
  const { data: appointmentsData, isLoading: appointmentsLoading } = useGetAppointmentsQuery(
    {
      clientId: selectedClientId || undefined,
      limit: 50
    },
    { skip: !selectedClientId }
  );

  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();

  const clients = clientsData?.response.data.docs || [];
  const appointments = appointmentsData?.response.data.docs || [];

  // Filter appointments that don't already have an invoice
  const availableAppointments = appointments.filter(appt => !appt.invoiceId);

  const clientOptions = clientsLoading
    ? [{ value: '', label: 'Loading clients...' }]
    : clients.length === 0
      ? [{ value: '', label: 'No clients found' }]
      : [
        { value: '', label: 'Select a client' },
        ...clients.map(client => ({
          value: client.id,
          label: `${client.firstName} ${client.lastName} - ${client.email}`
        }))
      ];

  useEffect(() => {
    if (isOpen) {
      setIsEditing(mode === 'edit');
      
      if (invoice) {
        // If editing existing invoice
        setSelectedClientId(fixedClientId || invoice.clientId || invoice.client?.id || '');
        setInvoiceDate(validDateOr(invoice.invoiceDate || invoice.issueDate, new Date()));
        setDueDate(validDateOr(invoice.dueDate, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)));
        setTaxRate(invoice.tax || 0);
        setNotes(invoice.notes || '');
        setInvoiceStatus(invoice.status || 'draft');
        
        // Set items from invoice data
        if (invoice.items && invoice.items.length > 0) {
          setItems(invoice.items.map((item: any, index: number) => ({
            id: (index + 1).toString(),
            description: item.description || item.session?.name || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.price || 0,
            total: item.total || (item.quantity || 1) * (item.unitPrice || item.price || 0),
            appointmentId: item.appointmentId
          })));
        } else if (invoice.appointments && invoice.appointments.length > 0) {
          // If invoice has appointments, create items from them
          setItems(invoice.appointments.map((appt: any, index: number) => ({
            id: (index + 1).toString(),
            description: appt.session?.name || 'Therapy Session',
            quantity: 1,
            unitPrice: appt.session?.price || 0,
            total: appt.session?.price || 0,
            appointmentId: appt.id
          })));
          setSelectedAppointmentIds(invoice.appointments.map((appt: any) => appt.id));
        }
      } else {
        // Creating new invoice
        setIsEditing(true);
        setSelectedClientId(fixedClientId || '');
        setSelectedAppointmentIds([]);
        setInvoiceDate(new Date());
        setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
        setItems([]);
        setTaxRate(0);
        setNotes('');
        setInvoiceStatus('draft');
      }

      setIsAppointmentsOpen(false);
    }
  }, [isOpen, invoice, mode, fixedClientId]);

  // When client changes, reset selected appointments and appointment-linked items
  useEffect(() => {
    if (selectedClientId && isEditing) {
      setSelectedAppointmentIds([]);
      setItems(prev => prev.filter(item => !item.appointmentId));
    }
  }, [selectedClientId, isEditing]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (isNaN(item.total) ? 0 : item.total), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  // Get selected client (fallback to invoice.client if not in the loaded clients list)
  const selectedClient = clients.find(client => client.id === selectedClientId) || (invoice?.client?.id === selectedClientId ? invoice.client : invoice?.client);

  // Handle appointment selection
  const handleAppointmentToggle = (appointmentId: string, appointment: Appointment) => {
    if (selectedAppointmentIds.includes(appointmentId)) {
      // Remove appointment
      setSelectedAppointmentIds(prev => prev.filter(id => id !== appointmentId));
      
      // Remove corresponding item if exists
      setItems(prev => prev.filter(item => item.appointmentId !== appointmentId));
    } else {
      // Add appointment
      setSelectedAppointmentIds(prev => [...prev, appointmentId]);
      
      // Add appointment as item
      const quantity = 1;
      const unitPrice = appointment.session?.price || 0;

      const newItem: InvoiceItem = {
        id: appointmentId,
        description: appointment.session?.name || 'Therapy Session',
        quantity,
        unitPrice,
        total: quantity * unitPrice,
        appointmentId: appointmentId
      };
      
      setItems(prev => [...prev, newItem]);
    }
  };

  const handleAddItem = () => {
    const newId = (items.length + 1).toString();
    setItems([
      ...items, 
      { 
        id: newId, 
        description: '', 
        quantity: 1, 
        unitPrice: 0, 
        total: 0 
      }
    ]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          const quantity = field === 'quantity' ? Number(value) : item.quantity;
          const unitPrice = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updatedItem.total = quantity * unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
      
      // Also remove from selected appointments if it was linked to one
      const itemToRemove = items.find(item => item.id === id);
      if (itemToRemove?.appointmentId) {
        setSelectedAppointmentIds(prev => prev.filter(apptId => apptId !== itemToRemove.appointmentId));
      }
    }
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      alert('Please select a client');
      return;
    }

    if (!dueDate) {
      alert('Please select a due date');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (items.some(item => !item.description || item.unitPrice <= 0)) {
      alert('Please fill in all item descriptions and ensure prices are greater than 0');
      return;
    }

    const invoiceData = {
      clientId: selectedClientId,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      subtotal,
      tax,
      total,
      dueDate: dueDate.toISOString(),
      invoiceDate: (invoiceDate || new Date()).toISOString()
    };

    try {
      if (invoice?.id) {
        // Update existing invoice
        await updateInvoice({
          id: invoice.id,
          data: invoiceData
        }).unwrap();
      } else {
        // Create new invoice
        await createInvoice(invoiceData).unwrap();
      }
      
      // Call parent's onSave callback if provided
      onSave?.(invoiceData);
      
      // Close modal
      onClose();
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      alert(`Failed to save invoice: ${error.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleDownload = async () => {
    const btn = document.getElementById('download-btn');
    const element = document.getElementById('invoice-content');
    if (btn && element) {
      const originalText = btn.textContent || 'Download PDF';
      btn.textContent = 'Capturing...';
      try {
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        btn.textContent = 'Generating PDF...';
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const filename = `Invoice_${selectedClient ? `${selectedClient.firstName}_${selectedClient.lastName}` : 'NEW'}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        btn.textContent = 'Downloaded!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('PDF Generation Error:', err);
        btn.textContent = 'Failed';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    }
  };

  const formatAddress = (client: Client) => {
    if (!client.address) return 'Address not specified';
    const { street, city, state, country, zip } = client.address;
    const parts = [street, city, state, zip, country].filter(Boolean);
    return parts.join(', ');
  };

  const formatPhone = (client: Client) => {
    return `${client.countryCode || ''} ${client.phoneNumber || ''}`.trim();
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Keep appointment-backed items synced with latest session pricing/quantity
  useEffect(() => {
    if (appointments.length === 0) {
      return;
    }

    setItems(prev => {
      let changed = false;

      const next = prev.map(item => {
        if (!item.appointmentId) {
          return item;
        }

        const appointment = appointments.find(appt => appt.id === item.appointmentId);
        if (!appointment) {
          return item;
        }

        const quantity = 1;
        const unitPrice = appointment.session?.price || 0;

        if (item.quantity === quantity && item.unitPrice === unitPrice) {
          return item;
        }

        changed = true;
        return {
          ...item,
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      });

      return changed ? next : prev;
    });
  }, [appointments]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Create Invoice" : "Invoice Preview"} size="xl">
      <div className="flex flex-col gap-4 mt-2 font-sans">
        <div id="invoice-content" className="bg-white text-slate-800 p-8 rounded-lg shadow-sm border border-slate-100 min-h-[500px] flex flex-col relative overflow-hidden max-w-3xl mx-auto w-full">
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary/40" style={{ backgroundImage: `linear-gradient(to right, ${branding.color}CC, ${branding.color}66)` }}></div>
          
          <div className="flex justify-between items-start pb-6 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4">
                {clinicLogo ? (
                  <img src={clinicLogo || undefined} alt="Clinic Logo" className="h-16 w-auto object-contain" />
                ) : (
                  <div className="h-16 w-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-sm" style={{ backgroundColor: branding.color }}>
                    IW
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold tracking-tight" style={{ color: branding.color }}>{clinicName}</h2>
                  <p className="text-xs text-muted-foreground">123 Healing Blvd, Suite 100</p>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end relative">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1">
                {invoiceStatus === 'paid' ? 'RECEIPT' : 'INVOICE'}
              </h1>
              <div className="text-sm font-medium mt-1">
                #{invoice?.id?.substring(0, 8).toUpperCase() || 'NEW-INVOICE'}
              </div>
              {invoiceStatus === 'paid' && !isEditing && (
                <div className="mt-2 inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold uppercase tracking-widest">
                  PAID
                </div>
              )}
              {isEditing && (
                <div className="mt-2">
                  <Select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as any)}
                    className="text-xs h-7"
                    options={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'sent', label: 'Sent' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'overdue', label: 'Overdue' }
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mb-8">
            <div className="w-1/2 pr-6">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Billed To</label>
              {fixedClientId ? (
                selectedClient ? (
                  <div className="space-y-3">
                    <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
                      <div className="font-medium">{selectedClient.firstName} {selectedClient.lastName}</div>
                      <div className="text-gray-600">{selectedClient.email}</div>
                      <div className="text-gray-600">{formatPhone(selectedClient)}</div>
                      <div className="text-gray-600">{formatAddress(selectedClient)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 italic">Loading client...</div>
                )
              ) : isEditing ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full"
                      disabled={clientsLoading}
                      options={clientOptions}
                    />
                  </div>
                  
                  {selectedClient && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
                      <div className="font-medium">{selectedClient.firstName} {selectedClient.lastName}</div>
                      <div className="text-gray-600">{selectedClient.email}</div>
                      <div className="text-gray-600">{formatPhone(selectedClient)}</div>
                      <div className="text-gray-600">{formatAddress(selectedClient)}</div>
                    </div>
                  )}
                </div>
              ) : (
                selectedClient ? (
                  <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
                    <div className="font-semibold text-slate-900 text-base mb-1">{selectedClient.firstName} {selectedClient.lastName}</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {selectedClient.email && <div>{selectedClient.email}</div>}
                      {formatPhone(selectedClient) && <div>{formatPhone(selectedClient)}</div>}
                      {formatAddress(selectedClient) && <div>{formatAddress(selectedClient)}</div>}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm italic bg-slate-50/50 p-4 rounded-lg border border-slate-100">No client selected</div>
                )
              )}
            </div>
            
            <div className="text-right space-y-3">
              <div className="flex justify-end items-center gap-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{invoiceStatus === 'paid' ? 'Receipt Date' : 'Invoice Date'}</span>
                {isEditing ? (
                  <div className="w-[160px]">
                    <DatePicker date={invoiceDate} setDate={setInvoiceDate} />
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-900">{invoiceDate ? formatDate(invoiceDate) : 'N/A'}</span>
                )}
              </div>
              <div className="flex justify-end items-center gap-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</span>
                {isEditing ? (
                  <div className="w-[160px]">
                    <DatePicker date={dueDate} setDate={setDueDate} />
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-900">{dueDate ? formatDate(dueDate) : 'N/A'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Available Appointments Section */}
          {isEditing && selectedClientId && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <button
                type="button"
                onClick={() => setIsAppointmentsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="h-4 w-4 text-blue-700 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800">Available Appointments for Invoice</h3>
                    <p className="text-xs text-blue-700/80">
                      {appointmentsLoading
                        ? 'Loading appointments...'
                        : `${availableAppointments.length} appointment${availableAppointments.length === 1 ? '' : 's'} available`}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-blue-700 transition-transform duration-200 ${isAppointmentsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isAppointmentsOpen && (
                <div className="mt-4">
                  {appointmentsLoading ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading appointments...
                    </div>
                  ) : availableAppointments.length === 0 ? (
                    <div className="text-sm text-blue-700">
                      {appointments.length === 0
                        ? 'No appointments found for this client'
                        : 'All appointments are already invoiced'
                      }
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {availableAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center gap-3 p-2 bg-white rounded border hover:bg-blue-50">
                          <Checkbox
                            checked={selectedAppointmentIds.includes(appointment.id)}
                            onCheckedChange={() => handleAppointmentToggle(appointment.id, appointment)}
                            disabled={appointment.invoiceId !== null}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{appointment.session?.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                              <span className="mx-1">-</span>
                              Duration: {appointment.session?.duration} min
                              <span className="mx-1">-</span>
                              {formatInvoiceCurrency(appointment.session?.price || 0)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Invoice Items Table */}
          <div className="mb-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-center py-3 px-3 w-20 font-semibold">Qty</th>
                  <th className="text-right py-3 px-3 w-28 font-semibold">Unit Price</th>
                  <th className="text-right py-3 px-4 w-28 font-semibold">Total</th>
                  {isEditing && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="h-9 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors"
                            placeholder="Item description"
                          />
                          {item.appointmentId && (
                            <div className="text-[10px] font-medium text-blue-600 flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              Linked to appointment
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-800">{item.description}</div>
                          {item.appointmentId && (
                            <div className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">Linked to appointment</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-9 text-center border-slate-200 bg-slate-50/50"
                        />
                      ) : (
                        <div className="font-medium text-slate-700">{item.quantity}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="h-9 text-right border-slate-200 bg-slate-50/50"
                          placeholder="0.00"
                        />
                      ) : (
                        <div className="font-medium text-slate-700">{formatInvoiceCurrency(item.unitPrice)}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-semibold text-slate-900">{formatInvoiceCurrency(item.total)}</div>
                    </td>
                    {isEditing && (
                      <td className="text-center">
                        <button 
                          onClick={() => removeItem(item.id)} 
                          className="text-red-400 hover:text-red-600 disabled:text-gray-300"
                          disabled={items.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {isEditing && (
              <div className="mt-4 flex gap-3">
                <Button variant="ghost" size="sm" onClick={handleAddItem} className="text-primary">
                  <Plus className="h-4 w-4 mr-2" /> Add Manual Item
                </Button>
              </div>
            )}
          </div>

          {/* Tax and Notes Section */}
          <div className="flex gap-8 mb-6 items-start">
            <div className="w-1/2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Notes & Terms</label>
              {isEditing ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes, payment terms, or instructions here..."
                  className="min-h-[100px] border-slate-200 bg-slate-50/50 text-sm"
                />
              ) : (
                <div className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50/50 p-4 rounded-lg border border-slate-100 min-h-[100px]">
                  {notes || 'Thank you for your business.'}
                </div>
              )}
            </div>
            
            <div className="w-1/2 flex justify-end">
              <div className="w-64 bg-slate-50/80 p-5 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900">{formatInvoiceCurrency(subtotal)}</span>
                </div>
                {isEditing ? (
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500">Tax (%)</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 text-right border-slate-200 bg-white text-sm"
                    />
                  </div>
                ) : (
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Tax ({taxRate}%)</span>
                    <span className="text-slate-900">{formatInvoiceCurrency(tax)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 w-full my-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">{invoiceStatus === 'paid' ? 'Total Paid' : 'Total Due'}</span>
                  <span className="text-xl font-bold" style={{ color: branding.color || '#1e293b' }}>
                    {formatInvoiceCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 text-center">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              Please make checks payable to {clinicName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2 px-1">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
            Cancel
          </Button>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isCreating || isUpdating}
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isCreating || isUpdating || !selectedClientId}
                >
                  {isCreating || isUpdating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {invoice?.id ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    invoice?.id ? 'Update Invoice' : 'Create Invoice'
                  )}
                </Button>
              </>
            ) : (
              <>
                {invoiceStatus !== 'paid' && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Invoice
                  </Button>
                )}
                <Button 
                  onClick={handleDownload} 
                  id="download-btn"
                  variant="outline"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Download PDF
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
