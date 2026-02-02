import React, { useState, useRef } from 'react';
import { Search, Upload, FileText, Check, Trash2, FilePlus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { cn } from '../../lib/utils';

interface ShareDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentName?: string;
}

interface SharedDoc {
    id: string;
    name: string;
    type: string;
}

export function ShareDocumentModal({ isOpen, onClose, documentName = 'ACE: Adverse Childhood Experiences Questionnaire' }: ShareDocumentModalProps) {
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [instructions, setInstructions] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const [includedDocs, setIncludedDocs] = useState<SharedDoc[]>([
        { id: '1', name: documentName, type: 'Clinical Outcome Measure' }
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!selectedPatient || includedDocs.length === 0) return;
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setIsSent(true);
            setTimeout(() => {
                onClose();
                setIsSent(false);
            }, 2000);
        }, 1500);
    };

    const handleUploadClick = () => {
        if (!selectedPatient) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newDoc: SharedDoc = {
                id: Date.now().toString(),
                name: file.name,
                type: 'Uploaded Resource'
            };
            setIncludedDocs([...includedDocs, newDoc]);
        }
    };

    const removeDoc = (id: string) => {
        setIncludedDocs(includedDocs.filter(d => d.id !== id));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Clinical Portal Distribution" size="xl">
            <div className="space-y-8 animate-in fade-in duration-300 p-2 sm:p-0">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Patient Search */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-widest">Target Recipient</label>
                    <div className="flex gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Select
                                value={selectedPatient || ''}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                options={[
                                    { value: '', label: 'Select Client...' },
                                    { value: '1', label: 'Sarah Connor (ID: SC-002)' },
                                    { value: '2', label: 'John Doe (ID: JD-045)' },
                                    { value: '3', label: 'Mike Miller (ID: MM-089)' }
                                ]}
                                className="h-12 border-none bg-muted/30 focus:ring-1 focus:ring-primary/20 rounded-xl font-medium text-foreground px-12"
                            />
                        </div>
                    </div>
                </div>

                {/* Selection Section - Gated */}
                <div className={cn("space-y-6 transition-all duration-500", !selectedPatient && "opacity-40 grayscale pointer-events-none select-none")}>
                    {/* Library Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-widest">Add Clinical Resources</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Select
                                    className="h-12 border-none bg-muted/30 focus:ring-1 focus:ring-primary/20 rounded-xl font-medium text-foreground"
                                    options={[{ value: 'all', label: 'All Resources' }, { value: 'forms', label: 'Clinical Forms' }, { value: 'edu', label: 'Documentation' }]}
                                    value="all"
                                />
                            </div>
                            <Button variant="outline" onClick={handleUploadClick} className="h-12 px-6 border-border/40 text-muted-foreground hover:bg-muted/10 hover:text-primary rounded-xl font-bold gap-2 shadow-sm transition-all whitespace-nowrap">
                                <Upload className="h-4 w-4" /> Upload Local
                            </Button>
                        </div>
                    </div>

                    {/* Documents Included */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-widest">Distribution Queue ({includedDocs.length})</label>
                        <div className="border border-border/40 rounded-xl p-6 lg:p-8 min-h-[160px] bg-muted/10 space-y-4 shadow-inner">
                            {includedDocs.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-border/40 rounded-xl group shadow-sm transition-all hover:border-primary/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                                            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-sm font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                                                {doc.name}
                                            </span>
                                            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{doc.type}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeDoc(doc.id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {includedDocs.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-in fade-in duration-500">
                                    <div className="p-3 bg-muted/50 rounded-full mb-3">
                                        <FilePlus className="h-8 w-8 opacity-40" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-widest">Queue is currently empty</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-widest">Clinician Notes for Recipient</label>
                    <textarea
                        className="w-full min-h-[120px] p-4 text-sm bg-muted/30 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 leading-relaxed font-medium placeholder:text-muted-foreground/50 transition-all"
                        placeholder="Include mandatory instructions or clinical context for the patient..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-start pt-4">
                    <Button
                        onClick={handleSend}
                        disabled={isSending || isSent || includedDocs.length === 0}
                        className={`h-12 px-10 rounded-xl font-bold transition-all shadow-lg ${isSent ? 'bg-green-600 hover:bg-green-600' : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                            }`}
                    >
                        {isSending ? (
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Distributing...
                            </div>
                        ) : isSent ? (
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 stroke-[3]" />
                                Transmission Successful
                            </div>
                        ) : 'Execute Distribution'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
