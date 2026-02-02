import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
interface CreateSessionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}
import { useData } from '../../context/DataContext';

export function CreateSessionTypeModal({
  isOpen,
  onClose
}: CreateSessionTypeModalProps) {
  const { addSessionType } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('150.00');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [description, setDescription] = useState('');
  const [emailReminder, setEmailReminder] = useState(true);
  const [smsReminder, setSmsReminder] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      rose: 'bg-rose-100 text-rose-700',
      amber: 'bg-amber-100 text-amber-700',
    };

    const reminders = [];
    if (emailReminder) reminders.push('Email');
    if (smsReminder) reminders.push('SMS');

    addSessionType({
      name: sessionName,
      duration: `${duration} min`,
      price: `$${price}`,
      color: colorMap[selectedColor] || 'bg-blue-100 text-blue-700',
      reminders
    });

    setTimeout(() => {
      setIsLoading(false);
      onClose();
      // Reset form
      setSessionName('');
      setDuration('60');
      setPrice('150.00');
      setSelectedColor('blue');
      setDescription('');
      setEmailReminder(true);
      setSmsReminder(false);
    }, 600);
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Create Session Type" description="Define a new service offering">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Session Name"
          placeholder="e.g. Initial Consultation"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className="h-11 rounded-xl"
          required
        />
        <Input
          label="Duration (minutes)"
          type="number"
          placeholder="60"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="h-11 rounded-xl"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          placeholder="150.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-11 rounded-xl"
          required
        />
        <Select
          label="Color Code"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          triggerClassName="h-11 rounded-xl"
          options={[
            { value: 'blue', label: 'Blue', color: '#3b82f6' },
            { value: 'green', label: 'Green', color: '#22c55e' },
            { value: 'purple', label: 'Purple', color: '#a855f7' },
            { value: 'orange', label: 'Orange', color: '#f97316' },
            { value: 'rose', label: 'Rose', color: '#f43f5e' },
            { value: 'amber', label: 'Amber', color: '#f59e0b' }
          ]}
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">Reminders</label>
        <div className="flex gap-6 pt-1">
          <Checkbox
            label="Email Reminder"
            checked={emailReminder}
            onCheckedChange={setEmailReminder}
          />
          <Checkbox
            label="SMS Reminder"
            checked={smsReminder}
            onCheckedChange={setSmsReminder}
          />
        </div>
      </div>

      <Textarea
        label="Description"
        placeholder="What does this session include?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-xl min-h-[100px]"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-xl px-6">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} className="h-11 rounded-xl px-6">
          Create Session Type
        </Button>
      </div>
    </form>
  </Modal>;
}