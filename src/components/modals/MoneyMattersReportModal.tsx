import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, FileText, TrendingUp, DollarSign, PieChart } from 'lucide-react';

interface MoneyMattersReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    range: string;
}

export function MoneyMattersReportModal({ isOpen, onClose, data, range }: MoneyMattersReportModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById('report-content');
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
            pdf.save(`Financial_Report_${range}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Report Generation Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!data) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Financial Report Details" size="xl">
            <div className="space-y-6 mt-4">
                <div id="report-content" className="bg-white p-8 border rounded-lg shadow-sm space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-6">
                        <div className="flex items-center gap-4">
                            <img src="/images/inkind logo-04.png" alt="Inkind Wellness" className="h-12 w-auto" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Financial Summary</h2>
                                <p className="text-sm text-muted-foreground">Range: <span className="capitalize">{range}</span></p>
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                            Generated on: {new Date().toLocaleDateString()}<br />
                            Inkind Wellness Center
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Total Income</span>
                            </div>
                            <div className="text-2xl font-black text-slate-800">${data.totalIncome.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Avg Revenue</span>
                            </div>
                            <div className="text-2xl font-black text-slate-800">${data.monthlyRevenue.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                            <div className="flex items-center gap-2 text-rose-600 mb-1">
                                <PieChart className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Expenses</span>
                            </div>
                            <div className="text-2xl font-black text-slate-800">${data.expensesTotal.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Breakdown Tables */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Income Sources Breakdown
                        </h3>
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-2 text-left">Category</th>
                                    <th className="px-4 py-2 text-center">Weight</th>
                                    <th className="px-4 py-2 text-right">Estimated Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-b">
                                {data.incomeSources.map((source: any) => (
                                    <tr key={source.name}>
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                                                {source.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{source.value}%</td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            ${((source.value / 100) * data.totalIncome).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Performance History (Textual Summary) */}
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Performance Narrative</h4>
                        <p className="text-sm leading-relaxed text-slate-600">
                            During this <span className="font-bold text-primary">{range}</span> period, Inkind Wellness Center generated a total gross revenue of <span className="font-bold">${data.totalIncome.toLocaleString()}</span>.
                            The majority of income was derived from <span className="font-bold">{data.incomeSources[0].name}</span> services, contributing {data.incomeSources[0].value}% of the total.
                            Operating expenses totaled <span className="font-bold">${data.expensesTotal.toLocaleString()}</span>, maintaining healthy margins.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-8 border-t text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Confidential Financial Report • Inkind Wellness Center</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={isGenerating}>Close</Button>
                    <Button onClick={handleDownload} disabled={isGenerating} className="gap-2">
                        {isGenerating ? 'Generating...' : <><Download className="h-4 w-4" /> Download Full Report</>}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
