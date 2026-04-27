import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, Calendar, Receipt } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ClientExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  notes: any[];
  appointments: any[];
  invoices: any[];
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (value?: number | null) => `£${Number(value || 0).toFixed(2)}`;

const getAuthorName = (note: any) => {
  const author = note.author || note.createdBy || note.user || note.clinician?.user || note.clinician;
  const name = [author?.firstName, author?.lastName].filter(Boolean).join(' ').trim();
  return name || author?.email || 'Clinician';
};

const getAppointmentClinician = (appointment: any) => {
  const user = appointment.clinician?.user;
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || appointment.clinicianName || '-';
};

export function ClientExportModal({ isOpen, onClose, client, notes, appointments, invoices }: ClientExportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const clientName = client?.name || [client?.firstName, client?.lastName].filter(Boolean).join(' ').trim() || 'Client';

  const handleDownload = async () => {
    const element = document.getElementById('client-export-content');
    if (!element) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Client_Record_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Client export generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Client Record Export Preview" size="xl">
      <div className="space-y-6 mt-4">
        <div id="client-export-content" className="bg-white p-8 border rounded-lg shadow-sm space-y-8">
          <div className="flex justify-between items-start border-b pb-6">
            <div className="flex items-center gap-4">
              <img src="/images/inkind logo-04.png" alt="InDesk" className="h-12 w-auto" />
              <div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Client Record Export</h2>
                <p className="text-sm text-muted-foreground">{clientName}</p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              Generated: {new Date().toLocaleDateString('en-GB')}<br />
              Notes: {notes.length} | Appointments: {appointments.length} | Invoices: {invoices.length}
            </div>
          </div>

          <section className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <FileText className="h-5 w-5 text-primary mb-2" />
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Clinical Notes</p>
              <p className="text-2xl font-black text-slate-800">{notes.length}</p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <Calendar className="h-5 w-5 text-primary mb-2" />
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Appointments</p>
              <p className="text-2xl font-black text-slate-800">{appointments.length}</p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <Receipt className="h-5 w-5 text-primary mb-2" />
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Invoices</p>
              <p className="text-2xl font-black text-slate-800">{invoices.length}</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Clinical Notes</h3>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clinical notes found.</p>
            ) : notes.map((note) => (
              <div key={note.id} className="rounded-lg border p-4 text-sm">
                <div className="mb-2 flex justify-between gap-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-slate-700">{getAuthorName(note)}</span>
                  <span>{formatDateTime(note.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-slate-700">{note.note || '-'}</p>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Appointments</h3>
            <table className="w-full text-[11px]">
              <thead className="bg-slate-100 text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Session</th>
                  <th className="px-3 py-2 text-left">Clinician</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.length === 0 ? (
                  <tr><td className="px-3 py-3 text-muted-foreground" colSpan={4}>No appointments found.</td></tr>
                ) : appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-3 py-3">{formatDateTime(appointment.startTime || appointment.start)}</td>
                    <td className="px-3 py-3">{appointment.session?.name || appointment.title || '-'}</td>
                    <td className="px-3 py-3">{getAppointmentClinician(appointment)}</td>
                    <td className="px-3 py-3 capitalize">{appointment.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Invoices</h3>
            <table className="w-full text-[11px]">
              <thead className="bg-slate-100 text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-left">Invoice</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length === 0 ? (
                  <tr><td className="px-3 py-3 text-muted-foreground" colSpan={4}>No invoices found.</td></tr>
                ) : invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-3 py-3 font-mono">#{String(invoice.id || '').slice(0, 8).toUpperCase()}</td>
                    <td className="px-3 py-3">{formatDateTime(invoice.invoiceDate || invoice.createdAt)}</td>
                    <td className="px-3 py-3 capitalize">{invoice.status || '-'}</td>
                    <td className="px-3 py-3 text-right font-semibold">{formatCurrency(invoice.totalAmount ?? invoice.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="pt-6 border-t text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
            Confidential client record export
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} disabled={isGenerating}>Cancel</Button>
          <Button onClick={handleDownload} disabled={isGenerating} className="gap-2">
            {isGenerating ? 'Exporting...' : <><Download className="h-4 w-4" /> Download Client PDF</>}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
