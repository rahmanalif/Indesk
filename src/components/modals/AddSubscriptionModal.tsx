import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';

interface AddSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (subscription: any) => void;
}

export function AddSubscriptionModal({ isOpen, onClose, onAdd }: AddSubscriptionModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [cycle, setCycle] = useState('monthly');
    const [status, setStatus] = useState('Active');
    const [nextBilling, setNextBilling] = useState<Date | undefined>(new Date());

    const CYCLE_OPTIONS = [
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'quarterly', label: 'Quarterly' }
    ];

    const STATUS_OPTIONS = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSub = {
            id: `SUB-${Math.floor(Math.random() * 10000)}`,
            name,
            price: `$${parseFloat(price).toFixed(2)}`,
            cycle: cycle.charAt(0).toUpperCase() + cycle.slice(1),
            nextBilling: nextBilling?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'N/A',
            status
        };
        onAdd?.(newSub);
        onClose();
        // Reset form
        setName('');
        setPrice('');
        setCycle('monthly');
        setStatus('Active');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Subscription">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Plan Name</label>
                    <Input
                        placeholder="e.g. Professional Plan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                                className="pl-6"
                                placeholder="49.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Billing Cycle</label>
                        <Select
                            options={CYCLE_OPTIONS}
                            value={cycle}
                            onChange={(e) => setCycle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            options={STATUS_OPTIONS}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Next Billing</label>
                        <DatePicker date={nextBilling} setDate={setNextBilling} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Subscription</Button>
                </div>
            </form>
        </Modal>
    );
}
