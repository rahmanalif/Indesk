import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Download, Edit2, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface InvoiceItem {
    id: string;
    description: string;
    amount: number;
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
    const [isEditing, setIsEditing] = useState(mode === 'edit');
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: 'Therapy Session - 60 min', amount: 150.00 }
    ]);
    const [clientName, setClientName] = useState('James Wilson');
    const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));

    useEffect(() => {
        if (isOpen) {
            setIsEditing(mode === 'edit');
            if (invoice) {
                setClientName(invoice.client || 'James Wilson');
                // Convert displayed date (e.g. "Mar 20, 2024") to YYYY-MM-DD for input[type=date]
                const dateObj = new Date(invoice.date);
                setInvoiceDate(isNaN(dateObj.getTime()) ? new Date() : dateObj);
            } else {
                setIsEditing(true);
                setClientName('James Wilson');
                setInvoiceDate(new Date());
                setItems([{ id: '1', description: 'Therapy Session - 60 min', amount: 150.00 }]);
            }
        }
    }, [isOpen, invoice, mode]);

    const total = items.reduce((sum, item) => sum + (isNaN(item.amount) ? 0 : item.amount), 0);

    const handleAddItem = () => {
        setItems([...items, { id: Math.random().toString(), description: '', amount: 0 }]);
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleSave = () => {
        const newInvoice = {
            id: invoice?.id || `INV-00${Math.floor(Math.random() * 1000)}`,
            client: clientName,
            date: invoiceDate ? invoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            amount: `$${total.toFixed(2)}`,
            status: invoice?.status || 'Pending'
        };
        onSave?.(newInvoice);
        setIsEditing(false); // Switch to preview mode
    };

    const handleDownload = async () => {
        const btn = document.getElementById('download-btn');
        const element = document.getElementById('invoice-content');
        if (btn && element) {
            btn.innerText = 'Capturing Invoice...';
            try {
                const canvas = await html2canvas(element, {
                    scale: 3, // High quality
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                btn.innerText = 'Generating PDF...';
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Invoice_${invoice?.id || 'NEW'}.pdf`);

                btn.innerText = 'Downloaded!';
                setTimeout(() => {
                    btn.innerText = 'Download PDF';
                }, 2000);
            } catch (err) {
                console.error('PDF Generation Error:', err);
                btn.innerText = 'Failed';
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Invoice" : "Invoice Preview"} size="xl">
            <div className="flex flex-col gap-6 mt-4">
                <div id="invoice-content" className="bg-white border text-slate-800 p-8 rounded-sm shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start border-b pb-8 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-4">
                                {branding.logo ? (
                                    <img src={branding.logo} alt="Clinic Logo" className="h-16 w-auto object-contain" />
                                ) : (
                                    <div className="h-16 w-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-sm" style={{ backgroundColor: branding.color }}>
                                        IW
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight" style={{ color: branding.color }}>Inkind Wellness</h2>
                                    <p className="text-xs text-muted-foreground">123 Healing Blvd, Suite 100</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-3xl font-light text-slate-300 uppercase tracking-widest">Invoice</h1>
                            <div className="text-sm font-medium mt-1">#INV-00123</div>
                        </div>
                    </div>

                    <div className="flex justify-between mb-12">
                        <div className="w-1/3">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Bill To</label>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <Select
                                        value={clientName}
                                        options={[
                                            { value: 'James Wilson', label: 'James Wilson' },
                                            { value: 'Emma Thompson', label: 'Emma Thompson' }
                                        ]}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                    <div className="text-sm text-muted-foreground">
                                        123 Wellness Ave<br />Health City, HC 90210
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="font-bold text-lg">{clientName}</div>
                                    <div className="text-sm text-slate-500">
                                        123 Wellness Ave<br />Health City, HC 90210
                                    </div>
                                </div>
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
                                    <span className="font-medium">{invoiceDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                )}
                            </div>
                            <div className="flex justify-end items-center gap-4">
                                <span className="text-sm font-medium text-muted-foreground mr-2">Due Date:</span>
                                {isEditing ? (
                                    <div className="w-[180px]">
                                        <DatePicker date={dueDate} setDate={setDueDate} />
                                    </div>
                                ) : (
                                    <span className="font-medium">{dueDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-y">
                                <tr>
                                    <th className="text-left py-3 px-2">Description</th>
                                    <th className="text-right py-3 px-2 w-32">Amount</th>
                                    {isEditing && <th className="w-10"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-3 px-2">
                                            {isEditing ? (
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                    className="h-9"
                                                />
                                            ) : (
                                                <div className="font-medium text-sm">{item.description}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={isNaN(item.amount) ? '' : item.amount}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        updateItem(item.id, 'amount', isNaN(val) ? 0 : val);
                                                    }}
                                                    className="h-9 text-right"
                                                />
                                            ) : (
                                                <div className="font-medium text-sm">${(isNaN(item.amount) ? 0 : item.amount).toFixed(2)}</div>
                                            )}
                                        </td>
                                        {isEditing && (
                                            <td className="text-center">
                                                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {isEditing && (
                            <div className="mt-4">
                                <Button variant="ghost" size="sm" onClick={handleAddItem} className="text-primary">
                                    <Plus className="h-4 w-4 mr-2" /> Add Item
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end mt-auto pt-8 border-t">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (0%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-dashed pt-3 mt-2">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 text-center text-xs text-muted-foreground">
                        <p>Thank you for your business. Please make checks payable to Inkind Wellness Center.</p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 px-1">
                    <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
                        Cancel
                    </Button>

                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Preview
                                </Button>
                                <Button onClick={handleSave}>
                                    Save Invoice
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit Invoice
                                </Button>
                                <Button onClick={handleDownload} id="download-btn">
                                    <Download className="h-4 w-4 mr-2" /> Download PDF
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}