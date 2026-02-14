import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { useUpdateClinicMemberMutation, useUpdateClinicMemberRoleMutation } from '../../redux/api/clientsApi';

interface EditClinicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinician: any;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function EditClinicianModal({ isOpen, onClose, clinician }: EditClinicianModalProps) {
    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [updateClinicMember] = useUpdateClinicMemberMutation();
    const [updateClinicMemberRole] = useUpdateClinicMemberRoleMutation();

    useEffect(() => {
        if (clinician) {
            const specialization = Array.isArray(clinician.specialization)
                ? clinician.specialization
                : (typeof clinician.specialty === 'string'
                    ? clinician.specialty.split(',').map((item: string) => item.trim()).filter(Boolean)
                    : []);
            const availability = Array.isArray(clinician.availability)
                ? clinician.availability.map((d: string) => d.toLowerCase())
                : [];

            setFormData({
                ...clinician,
                role: clinician.role || 'clinician',
                availability,
                specializationText: specialization.join(', '),
                bio: clinician.bio || '',
            });
        }
    }, [clinician]);

    if (!formData) return null;

    const toggleAvailability = (day: string, checked: boolean) => {
        const dayValue = day.toLowerCase();
        setFormData((prev: any) => {
            const current = Array.isArray(prev.availability) ? prev.availability : [];
            if (checked) {
                if (current.includes(dayValue)) return prev;
                return { ...prev, availability: [...current, dayValue] };
            }
            return { ...prev, availability: current.filter((item: string) => item !== dayValue) };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id) {
            alert('Member id is missing. Please refresh and try again.');
            return;
        }

        setIsLoading(true);

        const originalRole = (clinician?.role || '').toLowerCase();
        const nextRole = (formData.role || '').toLowerCase();
        const specialization = (formData.specializationText || '')
            .split(',')
            .map((item: string) => item.trim())
            .filter(Boolean);

        updateClinicMember({
            memberId: formData.id,
            availability: Array.isArray(formData.availability) ? formData.availability : [],
            specialization,
        })
            .unwrap()
            .then(async () => {
                if (nextRole && nextRole !== originalRole) {
                    await updateClinicMemberRole({
                        memberId: formData.id,
                        role: nextRole,
                    }).unwrap();
                }
                onClose();
            })
            .catch((error: any) => {
                const message = error?.data?.message || 'Failed to update team member. Please try again.';
                alert(message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Clinician Details">
            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Full Name"
                        value={formData.name || ''}
                        disabled
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email || ''}
                        disabled
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Phone Number"
                        value={formData.phoneNumber || ''}
                        disabled
                    />
                    <Select
                        label="Role"
                        value={formData.role || 'clinician'}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        options={[
                            { value: 'clinician', label: 'Clinician' },
                            { value: 'admin', label: 'Admin' },
                            { value: 'superAdmin', label: 'Super Admin' }
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium">Availability</label>
                    <div className="grid grid-cols-2 gap-3">
                        {DAYS.map(day => (
                            <Checkbox
                                key={day}
                                label={day}
                                checked={Array.isArray(formData.availability) && formData.availability.includes(day.toLowerCase())}
                                onCheckedChange={(checked) => toggleAvailability(day, checked)}
                            />
                        ))}
                    </div>
                </div>

                <Input
                    label="Specialization"
                    value={formData.specializationText || ''}
                    onChange={(e) => setFormData({ ...formData, specializationText: e.target.value })}
                    placeholder="Therapy, Counseling"
                />
                <Textarea
                    label="Bio / Notes"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Specializations, background, etc."
                    disabled
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
}
