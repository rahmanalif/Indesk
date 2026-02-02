import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Download, CreditCard, Receipt } from 'lucide-react';

interface BillingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    billingItem: any;
}

export function BillingDetailsModal({ isOpen, onClose, billingItem }: BillingDetailsModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById('receipt-content');
        if (!element) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 3,
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
            pdf.save(`Receipt_${billingItem.id}.pdf`);
        } catch (error) {
            console.error('Receipt Generation Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!billingItem) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Billing Details">
            <div className="space-y-6 mt-2">
                <div id="receipt-content" className="bg-white p-6 rounded-lg border shadow-sm space-y-8">
                    {/* Brand Header */}
                    <div className="flex justify-between items-center border-b pb-6">
                        <div className="flex items-center gap-3">
                            <img src="/images/inkind logo-04.png" alt="Inkind Wellness" className="h-10 w-auto" />
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight leading-tight">Receipt</h2>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-primary">Inkind Wellness Center</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                                <Receipt className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-start p-4 bg-muted/30 rounded-lg border">
                        <div>
                            <h3 className="font-bold text-lg">{billingItem.description}</h3>
                            <p className="text-sm text-muted-foreground">Invoice #{billingItem.id}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{billingItem.amount}</div>
                            <Badge variant="success" className="mt-1">Paid</Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b pb-2">Payment Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs">Date Paid</span>
                                <span className="font-medium">{billingItem.date}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Payment Method</span>
                                <span className="font-medium flex items-center gap-2">
                                    <CreditCard className="h-3 w-3" /> Visa •••• 4242
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b pb-2">Line Items</h4>
                        <div className="flex justify-between text-sm py-1">
                            <span>{billingItem.description}</span>
                            <span className="font-medium">{billingItem.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 text-muted-foreground">
                            <span>Tax (0%)</span>
                            <span className="font-medium">$0.00</span>
                        </div>
                        <div className="flex justify-between text-lg font-extrabold pt-2 border-t mt-2">
                            <span>Total Amount</span>
                            <span>{billingItem.amount}</span>
                        </div>
                    </div>

                    <div className="pt-8 text-center border-t border-dashed">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Thank you for your business!</p>
                        <p className="text-[9px] text-muted-foreground mt-1">123 Healing Blvd, Suite 100 • Health City, HC 90210</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isGenerating}>Close</Button>
                    <Button onClick={handleDownload} disabled={isGenerating} className="gap-2">
                        {isGenerating ? 'Generating...' : <><Download className="h-4 w-4" /> Download Receipt</>}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
