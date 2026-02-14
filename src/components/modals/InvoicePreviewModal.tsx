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
import { Download, Edit2, Plus, Trash2, Loader2, Calendar, Clock } from 'lucide-react';
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
}

export function InvoicePreviewModal({ isOpen, onClose, onSave, invoice, mode = 'view' }: InvoicePreviewModalProps) {
  const { branding } = useData();
  const { data: clinicResponse } = useGetClinicQuery();
  const clinic = clinicResponse?.response?.data;
  const apiOrigin = (() => {
    try {
      return new URL(import.meta.env.VITE_CLIENTS_API_BASE_URL).origin;
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
        setSelectedClientId(invoice.clientId || invoice.client?.id || '');
        setInvoiceDate(invoice.issueDate ? new Date(invoice.issueDate) : new Date());
        setDueDate(invoice.dueDate ? new Date(invoice.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
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
        setSelectedClientId('');
        setSelectedAppointmentIds([]);
        setInvoiceDate(new Date());
        setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
        setItems([]);
        setTaxRate(0);
        setNotes('');
        setInvoiceStatus('draft');
      }
    }
  }, [isOpen, invoice, mode]);

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

  // Get selected client
  const selectedClient = clients.find(client => client.id === selectedClientId);

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

    // Prepare appointment IDs (only include valid ones)
    const validAppointmentIds = items
      .map(item => item.appointmentId)
      .filter((id): id is string => !!id && selectedAppointmentIds.includes(id));

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
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Invoice" : "Invoice Preview"} size="xl">
      <div className="flex flex-col gap-6 mt-4">
        <div id="invoice-content" className="bg-white border text-slate-800 p-8 rounded-sm shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start border-b pb-8 mb-8">
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
            <div className="text-right">
              <h1 className="text-3xl font-light text-slate-300 uppercase tracking-widest">Invoice</h1>
              <div className="text-sm font-medium mt-1">
                #{invoice?.id?.substring(0, 8).toUpperCase() || 'NEW-INVOICE'}
              </div>
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
            <div className="w-1/3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Bill To</label>
              {isEditing ? (
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
                  <div>
                    <div className="font-bold text-lg">{selectedClient.firstName} {selectedClient.lastName}</div>
                    <div className="text-sm text-slate-500">
                      {selectedClient.email}<br />
                      {formatPhone(selectedClient)}<br />
                      {formatAddress(selectedClient)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 italic">No client selected</div>
                )
              )}
            </div>
            
            <div className="text-right space-y-2">
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground mr-2">Invoice Date:</span>
                {isEditing ? (
                  <div className="w-[180px]">
                    <DatePicker date={invoiceDate} setDate={setInvoiceDate} />
                  </div>
                ) : (
                  <span className="font-medium">{invoiceDate ? formatDate(invoiceDate) : 'N/A'}</span>
                )}
              </div>
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground mr-2">Due Date:</span>
                {isEditing ? (
                  <div className="w-[180px]">
                    <DatePicker date={dueDate} setDate={setDueDate} />
                  </div>
                ) : (
                  <span className="font-medium">{dueDate ? formatDate(dueDate) : 'N/A'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Available Appointments Section */}
          {isEditing && selectedClientId && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Available Appointments for Invoice
              </h3>
              
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
                <div className="space-y-2">
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
                          ${appointment.session?.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoice Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-y">
                <tr>
                  <th className="text-left py-3 px-2">Description</th>
                  <th className="text-center py-3 px-2 w-20">Qty</th>
                  <th className="text-right py-3 px-2 w-32">Unit Price</th>
                  <th className="text-right py-3 px-2 w-32">Total</th>
                  {isEditing && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-2">
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="h-9"
                            placeholder="Item description"
                          />
                          {item.appointmentId && (
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Linked to appointment
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-sm">{item.description}</div>
                          {item.appointmentId && (
                            <div className="text-xs text-blue-600">Linked to appointment</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-9 text-center"
                        />
                      ) : (
                        <div className="font-medium text-sm">{item.quantity}</div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="h-9 text-right"
                          placeholder="0.00"
                        />
                      ) : (
                        <div className="font-medium text-sm">${item.unitPrice.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="font-medium text-sm">${item.total.toFixed(2)}</div>
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
          <div className="flex gap-8 mb-8">
            <div className="w-1/2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Notes</label>
              {isEditing ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or terms here..."
                  className="min-h-[100px]"
                />
              ) : (
                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                  {notes || 'No notes'}
                </div>
              )}
            </div>
            
            <div className="w-1/2 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {isEditing ? (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax (%)</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 text-right"
                    />
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-dashed pt-3 mt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 text-center text-xs text-muted-foreground">
            <p>Thank you for your business. Please make checks payable to Inkind Wellness Center.</p>
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
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Edit Invoice
                </Button>
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
