import React from 'react';
import { Modal } from '../ui/Modal';
import { Calendar, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ClientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
}

export function ClientHistoryModal({ isOpen, onClose, clientName }: ClientHistoryModalProps) {
    // Mock Appointment History
    const appointments = [
        { id: 1, type: 'Follow-up Session', date: 'Mar 15, 2024', time: '10:00 AM', status: 'Completed', clinician: 'Dr. Sarah Smith' },
        { id: 2, type: 'Therapy Session', date: 'Mar 01, 2024', time: '02:00 PM', status: 'Completed', clinician: 'Dr. Sarah Smith' },
        { id: 3, type: 'Initial Consultation', date: 'Feb 15, 2024', time: '11:00 AM', status: 'Completed', clinician: 'Dr. Sarah Smith' },
        { id: 4, type: 'Therapy Session', date: 'Feb 01, 2024', time: '09:00 AM', status: 'Cancelled', clinician: 'Dr. Sarah Smith' },
        { id: 5, type: 'Introductory Call', date: 'Jan 20, 2024', time: '03:30 PM', status: 'No Show', clinician: 'Admin Staff' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Cancelled': return 'destructive';
            case 'No Show': return 'warning';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="h-3 w-3 mr-1" />;
            case 'Cancelled': return <XCircle className="h-3 w-3 mr-1" />;
            case 'No Show': return <Clock className="h-3 w-3 mr-1" />;
            default: return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Appointment History - ${clientName}`} size="lg">
            <div className="mt-4">
                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="py-3 px-4">Date & Time</th>
                                <th className="py-3 px-4">Session Type</th>
                                <th className="py-3 px-4">Clinician</th>
                                <th className="py-3 px-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {appointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-muted/5">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium text-foreground">{apt.date}</p>
                                                <p className="text-xs text-muted-foreground">{apt.time}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium">{apt.type}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            {apt.clinician}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Badge variant={getStatusColor(apt.status) as any} className="inline-flex items-center">
                                            {getStatusIcon(apt.status)}
                                            {apt.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-center text-xs text-muted-foreground">
                    Showing last {appointments.length} records
                </div>
            </div>
        </Modal>
    );
}
