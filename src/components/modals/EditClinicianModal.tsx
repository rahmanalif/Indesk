import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';

interface EditClinicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinician: any;
}

export function EditClinicianModal({ isOpen, onClose, clinician }: EditClinicianModalProps) {
    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (clinician) {
            setFormData({ ...clinician });
        }
    }, [clinician]);

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
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Clinician Details">
            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Full Name"
                        defaultValue={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        defaultValue={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Phone Number"
                        defaultValue={formData.phone || '+1 (555) 000-0000'}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Select
                        label="Role"
                        defaultValue={formData.role}
                        options={[
                            { value: 'Clinical Director', label: 'Clinical Director' },
                            { value: 'Senior Therapist', label: 'Senior Therapist' },
                            { value: 'Therapist', label: 'Therapist' },
                            { value: 'Intern', label: 'Intern' },
                            { value: 'Admin', label: 'Admin' }
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium">Availability</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <Checkbox key={day} label={day} defaultChecked={true} />
                        ))}
                    </div>
                </div>



                <Textarea
                    label="Bio / Notes"
                    defaultValue={formData.bio || ''}
                    placeholder="Specializations, background, etc."
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
}
