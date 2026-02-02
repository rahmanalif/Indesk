import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';

interface EditSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription?: {
        name: string;
        price: string;
        cycle: string;
        status: string;
        nextBilling: string;
    } | null;
}

export function EditSubscriptionModal({ isOpen, onClose, subscription }: EditSubscriptionModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [cycle, setCycle] = useState('monthly');
    const [status, setStatus] = useState('active');
    const [nextBilling, setNextBilling] = useState<Date | undefined>(new Date());

    const CYCLE_OPTIONS = [
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'quarterly', label: 'Quarterly' }
    ];

    const STATUS_OPTIONS = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'past_due', label: 'Past Due' }
    ];

    // Pre-fill form when subscription prop changes
    useEffect(() => {
        if (subscription) {
            setName(subscription.name);
            setPrice(subscription.price.replace('$', ''));
            setCycle(subscription.cycle.toLowerCase());
            setStatus(subscription.status.toLowerCase());
            // Simplistic date parsing for demo
            setNextBilling(new Date());
        }
    }, [subscription, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle update logic here
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Subscription">
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
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
}
