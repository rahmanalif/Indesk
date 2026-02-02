import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { TimePicker } from '../ui/TimePicker';
import { Select } from '../ui/Select';

interface BookSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
}

export function BookSessionModal({ isOpen, onClose, clientName }: BookSessionModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState('09:00');
    const [type, setType] = useState('Consultation');
    const [isLoading, setIsLoading] = useState(false);

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 1500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Book New Session" size="md">
            <form onSubmit={handleBook} className="space-y-6 mt-2">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h4 className="text-sm font-medium text-primary mb-1">Booking for</h4>
                    <p className="text-lg font-bold">{clientName}</p>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <DatePicker label="Date" date={date} setDate={setDate} />
                        <TimePicker label="Time" time={time} setTime={setTime} />
                    </div>

                    <Select
                        label="Session Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        options={[
                            { value: 'Consultation', label: 'Consultation (30 min)' },
                            { value: 'Therapy Session', label: 'Therapy Session (60 min)' },
                            { value: 'Follow-up', label: 'Follow-up (15 min)' },
                            { value: 'Emergency', label: 'Emergency' }
                        ]}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Confirm Booking</Button>
                </div>
            </form>
        </Modal>
    );
}
