import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, Users, ShieldCheck, Mail, MapPin } from 'lucide-react';

interface ClientsReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    clients: any[];
}

export function ClientsReportModal({ isOpen, onClose, clients }: ClientsReportModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById('clients-report-content');
        if (!element) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Clients_Directory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Directory Generation Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!clients) return null;

    const activeCount = clients.filter(c => c.status === 'Active').length;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Clients Directory Export Preview" size="xl">
            <div className="space-y-6 mt-4">
                <div id="clients-report-content" className="bg-white p-8 border rounded-lg shadow-sm space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-6">
                        <div className="flex items-center gap-4">
                            <img src="/images/inkind logo-04.png" alt="Inkind Wellness" className="h-12 w-auto" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Clients Master Directory</h2>
                                <p className="text-sm text-muted-foreground">Inkind Wellness Administrative Record</p>
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                            Generated: {new Date().toLocaleDateString()}<br />
                            Total Records: {clients.length}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Clients</p>
                                <p className="text-2xl font-black text-slate-800">{clients.length}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-4">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Active Load</p>
                                <p className="text-2xl font-black text-slate-800">{activeCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="space-y-4">
                        <table className="w-full text-[11px]">
                            <thead className="bg-slate-100 text-muted-foreground font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">Client Name / Email</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Clinician</th>
                                    <th className="px-4 py-3 text-right">Next Appointment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {clients.map((client, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-800">{client.name}</div>
                                            <div className="text-muted-foreground text-[10px]">{client.email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-full ${client.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                    client.status === 'Waiting List' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{client.clinician}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground font-mono">{client.nextApt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Institutional Footer */}
                    <div className="pt-8 border-t flex justify-between items-center opacity-60">
                        <div className="flex items-center gap-4 text-[9px] uppercase font-bold text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> contact@inkind.com</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> London Central</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium italic">Authorized Directory Export</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={isGenerating}>Cancel</Button>
                    <Button onClick={handleDownload} disabled={isGenerating} className="gap-2">
                        {isGenerating ? 'Exporting...' : <><Download className="h-4 w-4" /> Download Directory PDF</>}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
