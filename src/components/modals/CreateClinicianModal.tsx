import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { useCreateClinicMemberMutation } from '../../redux/api/clientsApi';

interface CreateClinicianModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function CreateClinicianModal({
  isOpen,
  onClose
}: CreateClinicianModalProps) {
  const [createClinicMember] = useCreateClinicMemberMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+880');
  const [role, setRole] = useState('clinician');
  const [availability, setAvailability] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [bio, setBio] = useState('');
  const [specializationText, setSpecializationText] = useState('');

  const toggleAvailability = (day: string, checked: boolean) => {
    const dayValue = day.toLowerCase();
    setAvailability((prev) => {
      if (checked) {
        if (prev.includes(dayValue)) return prev;
        return [...prev, dayValue];
      }
      return prev.filter((d) => d !== dayValue);
    });
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setCountryCode('+880');
    setRole('clinician');
    setAvailability(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
    setBio('');
    setSpecializationText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const specialization = specializationText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    createClinicMember({
      email: email.trim(),
      role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      countryCode: countryCode.trim() || undefined,
      bio: bio.trim() || undefined,
      specialization: specialization.length > 0 ? specialization : undefined,
      availability,
    })
      .unwrap()
      .then(() => {
        resetForm();
        onClose();
      })
      .catch((error: any) => {
        const message = error?.data?.message || 'Failed to add team member. Please try again.';
        alert(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Add New Clinician" description="Onboard a new team member">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Country Code" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[{
            value: 'clinician',
            label: 'Clinician'
          }, {
            value: 'admin',
            label: 'Admin'
          }]}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Availability</label>
        <div className="grid grid-cols-2 gap-3">
          {DAYS.map(day => (
            <Checkbox
              key={day}
              label={day}
              checked={availability.includes(day.toLowerCase())}
              onCheckedChange={(checked) => toggleAvailability(day, checked)}
            />
          ))}
        </div>
      </div>

      <Input
        label="Specialization"
        placeholder="Psychology, CBT, Anxiety"
        value={specializationText}
        onChange={(e) => setSpecializationText(e.target.value)}
      />
      <Textarea
        label="Bio / Notes"
        placeholder="Licensed clinical psychologist with 8 years experience"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Add Clinician
        </Button>
      </div>
    </form>
  </Modal>;
}
