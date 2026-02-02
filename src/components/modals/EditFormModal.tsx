import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface EditFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: any;
}

export function EditFormModal({ isOpen, onClose, form }: EditFormModalProps) {
    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (form) {
            setFormData({ ...form });
        }
    }, [form]);

    if (!formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Questionnaire">
            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                <Input
                    label="Form Name"
                    defaultValue={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Draft', label: 'Draft' },
                        { value: 'Archived', label: 'Archived' }
                    ]}
                />

                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-medium text-sm mb-2">Form Questions Preview</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>How are you feeling today? (Rating)</li>
                        <li>Describe your sleep quality (Text)</li>
                        <li>Have you taken your medication? (Yes/No)</li>
                    </ul>
                    <Button variant="link" size="sm" className="px-0 mt-2 h-auto">
                        Launch Builder to Edit Questions
                    </Button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
}
