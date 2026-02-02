import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
interface CreateClinicianModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function CreateClinicianModal({
  isOpen,
  onClose
}: CreateClinicianModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Add New Clinician" description="Onboard a new team member">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" required />
        <Input label="Last Name" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" required />
        <Input label="Phone" type="tel" />
      </div>

      <Select label="Role" options={[{
        value: 'lead',
        label: 'Lead Clinician'
      }, {
        value: 'associate',
        label: 'Associate Clinician'
      }, {
        value: 'admin',
        label: 'Admin Staff'
      }]} />

      <div className="space-y-3">
        <label className="text-sm font-medium">Availability</label>
        <div className="grid grid-cols-2 gap-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => <Checkbox key={day} label={day} defaultChecked />)}
        </div>
      </div>



      <Textarea label="Bio / Notes" placeholder="Specializations, background, etc." />

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