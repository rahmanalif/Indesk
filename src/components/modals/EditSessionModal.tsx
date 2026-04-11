import React, { useState, useEffect } from 'react';
import { PoundSterling } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
import { useUpdateSessionMutation } from '../../redux/api/clientsApi';

interface EditSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
}

export function EditSessionModal({ isOpen, onClose, session }: EditSessionModalProps) {
    const [updateSession] = useUpdateSessionMutation();
    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session) {
            setFormData({ ...session });
        }
    }, [session]);

    if (!formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const durationValue = Number(formData.duration);
        const priceValue = Number(formData.price);

        updateSession({
            sessionId: formData.id,
            name: formData.name || '',
            description: formData.description || null,
            duration: Number.isFinite(durationValue) ? durationValue : 0,
            price: Number.isFinite(priceValue) ? priceValue : 0,
        })
            .unwrap()
            .then(() => {
                onClose();
            })
            .catch((error: any) => {
                alert(error?.data?.message || 'Failed to update session type.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Session Type" description="Modify your service details">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Session Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 rounded-xl"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="h-11 rounded-xl"
                    />
                    <Input
                        label="Price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="h-11 rounded-xl"
                        icon={<PoundSterling className="h-4 w-4" />}
                    />
                </div>

                <Textarea
                    label="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="rounded-xl min-h-[100px]"
                />

                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">Active Reminders</label>
                    <div className="flex gap-6 pt-1">
                        <Checkbox
                            label="Email"
                            checked={formData.reminders?.includes('Email')}
                            onCheckedChange={(checked) => {
                                const reminders = checked
                                    ? [...(formData.reminders || []), 'Email']
                                    : (formData.reminders || []).filter((r: string) => r !== 'Email');
                                setFormData({ ...formData, reminders });
                            }}
                        />
                        <Checkbox
                            label="SMS"
                            checked={formData.reminders?.includes('SMS')}
                            onCheckedChange={(checked) => {
                                const reminders = checked
                                    ? [...(formData.reminders || []), 'SMS']
                                    : (formData.reminders || []).filter((r: string) => r !== 'SMS');
                                setFormData({ ...formData, reminders });
                            }}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-xl px-6">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="h-11 rounded-xl px-6">
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
