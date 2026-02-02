import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function CreateInvoiceModal({
  isOpen,
  onClose
}: CreateInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice" description="Generate a new invoice for a client">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select label="Client" options={[{
        value: '',
        label: 'Select Client...'
      }, {
        value: '1',
        label: 'James Wilson'
      }, {
        value: '2',
        label: 'Emma Thompson'
      }]} required />

        <div className="grid grid-cols-2 gap-4">
          <DatePicker label="Invoice Date" date={date} setDate={setDate} />
          <DatePicker label="Due Date" date={date} setDate={setDate} />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Line Items</label>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Description" className="flex-1" defaultValue="Therapy Session - Mar 20" />
              <Input placeholder="Amount" type="number" className="w-24" defaultValue="150.00" />
            </div>
            <Button type="button" variant="ghost" size="sm" className="text-primary">
              + Add Item
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <span className="font-medium">Total Amount</span>
          <span className="text-xl font-bold">$150.00</span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Generate Invoice
          </Button>
        </div>
      </form>
    </Modal>;
}