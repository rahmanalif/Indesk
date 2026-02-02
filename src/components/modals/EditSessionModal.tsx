import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { useData } from '../../context/DataContext';

interface EditSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
}

export function EditSessionModal({ isOpen, onClose, session }: EditSessionModalProps) {
    const { updateSessionType } = useData();
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

        updateSessionType(formData);

        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 600);
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
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="h-11 rounded-xl"
                    />
                    <Input
                        label="Price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="h-11 rounded-xl"
                    />
                </div>

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
