import React from 'react';
import { Modal } from '../ui/Modal';
import { Calendar, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useGetClientAppointmentsQuery } from '../../redux/api/clientsApi';

interface ClientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
    clientId: string;
}

export function ClientHistoryModal({ isOpen, onClose, clientName, clientId }: ClientHistoryModalProps) {
    const { data, isLoading, isError } = useGetClientAppointmentsQuery(clientId, {
        skip: !clientId || !isOpen,
    });

    const appointments = (data?.response?.data?.docs || []).map((apt) => {
        const start = apt.startTime ? new Date(apt.startTime) : null;
        const status = (apt.status || '').toLowerCase();

        const normalizedStatus =
            status === 'completed' ? 'Completed'
            : status === 'cancelled' || status === 'canceled' ? 'Cancelled'
            : status === 'no_show' || status === 'no show' ? 'No Show'
            : status === 'pending' ? 'Pending'
            : status || 'Unknown';

        return {
            id: apt.id,
            type: apt.note || (apt.meetingType ? `${apt.meetingType.toUpperCase()} Session` : 'Session'),
            date: start ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
            time: start ? start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '-',
            status: normalizedStatus,
            clinician: apt.clinicianId ? `Clinician ${apt.clinicianId.slice(0, 6)}` : 'Clinician'
        };
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Cancelled': return 'destructive';
            case 'No Show': return 'warning';
            case 'Pending': return 'secondary';
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
                    {isLoading ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">Loading appointments...</div>
                    ) : isError ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">Failed to load appointments.</div>
                    ) : appointments.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">No appointments found.</div>
                    ) : (
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
                    )}
                </div>

                {!isLoading && !isError && appointments.length > 0 && (
                    <div className="mt-4 text-center text-xs text-muted-foreground">
                        Showing last {appointments.length} records
                    </div>
                )}
            </div>
        </Modal>
    );
}
