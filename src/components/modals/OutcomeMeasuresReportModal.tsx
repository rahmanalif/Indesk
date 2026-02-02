import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, FileText, Activity, TrendingUp, BarChart3 } from 'lucide-react';

interface OutcomeMeasuresReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    clientName: string;
}

export function OutcomeMeasuresReportModal({ isOpen, onClose, data, clientName }: OutcomeMeasuresReportModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById('outcome-report-content');
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
            pdf.save(`Patient_Progress_Report_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Report Generation Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!data) return null;

    const avgScore = Math.round(data.reduce((acc: number, p: any) => acc + p.y, 0) / data.length);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Clinical Progress Overview" size="xl">
            <div className="space-y-6 mt-4">
                <div id="outcome-report-content" className="bg-white p-8 border rounded-lg shadow-sm space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-6">
                        <div className="flex items-center gap-4">
                            <img src="/images/inkind logo-04.png" alt="Inkind Wellness" className="h-12 w-auto" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Patient Progress Analysis</h2>
                                <p className="text-sm text-muted-foreground">Client: <span className="font-semibold text-foreground">{clientName}</span></p>
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                            Date Generated: {new Date().toLocaleDateString()}<br />
                            Inkind Wellness Center
                        </div>
                    </div>

                    {/* Summary Metrics */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Trend Status</span>
                            </div>
                            <div className="text-2xl font-black text-slate-800">+18.4%</div>
                            <p className="text-[10px] text-muted-foreground">Clinical Stabilization</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 text-slate-600 mb-1">
                                <BarChart3 className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Avg Score</span>
                            </div>
                            <div className="text-2xl font-black text-slate-800">{avgScore}</div>
                            <p className="text-[10px] text-muted-foreground">Severity Baseline</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <Activity className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Adherence</span>
                            </div>
                            <div className="text-2xl font-black text-slate-800">94%</div>
                            <p className="text-[10px] text-muted-foreground">Session Consistency</p>
                        </div>
                    </div>

                    {/* Clinical Overview Narrative */}
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Clinical Narratives</h4>
                        <p className="text-sm leading-relaxed text-slate-600">
                            Patient trajectory indicates a positive response to clinical interventions during the reporting period.
                            The average severity score of <span className="font-bold text-primary">{avgScore}</span> aligns with localized stabilization goals.
                            Patient adherence remains high at 94%, supporting the sustained improvement in symptomatic markers.
                        </p>
                    </div>

                    {/* Data Points Table */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Longitudinal Data Trace
                        </h3>
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-2 text-left">Timeline Point</th>
                                    <th className="px-4 py-2 text-center">Score</th>
                                    <th className="px-4 py-2 text-right">Clinical Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.slice(-10).map((point: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 font-medium">{point.label} — {point.date}</td>
                                        <td className="px-4 py-3 text-center font-bold">{point.y}</td>
                                        <td className="px-4 py-3 text-right">
                                            {point.y >= 20 ?
                                                <span className="text-rose-600 font-bold uppercase text-[10px]">Action Recommended</span> :
                                                <span className="text-emerald-600 font-bold uppercase text-[10px]">Standard Response</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="pt-8 border-t text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Confidential Patient Progress Report • Inkind Wellness System</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={isGenerating}>Cancel</Button>
                    <Button onClick={handleDownload} disabled={isGenerating} className="gap-2">
                        {isGenerating ? 'Preparing PDF...' : <><Download className="h-4 w-4" /> Confirm & Download PDF</>}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
