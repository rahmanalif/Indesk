import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Clock, Calendar, FileText, MapPin, DollarSign } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { CreateAppointmentModal } from './CreateAppointmentModal';
import { useData } from '../../context/DataContext';

interface SessionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
}

export function SessionDetailsModal({ isOpen, onClose, session }: SessionDetailsModalProps) {
    const { updateAppointment } = useData();
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

    if (!session) return null;

    const handleStartSession = () => {
        window.open(session.videoLink || 'https://zoom.us', '_blank');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Session Details">
            <div className="space-y-6 mt-2">
                {/* Header User Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <Avatar fallback={session.client[0]} className="h-12 w-12 bg-primary/10 text-primary">
                        {session.client.split(' ').map((n: string) => n[0]).join('')}
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-lg">{session.client}</h3>
                        <p className="text-sm text-muted-foreground">Client ID: #88392</p>
                    </div>
                    <Badge variant={session.status === 'confirmed' ? 'success' : 'secondary'} className="ml-auto">
                        {session.status}
                    </Badge>
                </div>

                {/* Time and Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-md border border-border/50">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <div className="text-xs text-muted-foreground">Date</div>
                            <div className="font-medium text-sm">March 22, 2024</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-md border border-border/50">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <div className="text-xs text-muted-foreground">Time</div>
                            <div className="font-medium text-sm">{session.time} ({session.duration})</div>
                        </div>
                    </div>
                </div>

                {/* Details List */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Session Info</h4>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Type</span>
                            <span className="font-medium text-sm">{session.type}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Location</span>
                            <span className="font-medium text-sm">Room 3B</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> Fee</span>
                            <span className="font-medium text-sm">$150.00</span>
                        </div>
                    </div>
                </div>

                {/* Notes Preview */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Pre-session Notes</h4>
                    <div className="p-3 bg-yellow-50/50 text-yellow-900/80 text-sm rounded border border-yellow-100/50">
                        Client mentioned feeling anxious about upcoming travel. Review breathing exercises.
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    <Button variant="outline" onClick={() => setIsRescheduleOpen(true)}>Reschedule</Button>
                    <Button onClick={handleStartSession}>Start Session</Button>
                </div>
            </div>

            <CreateAppointmentModal
                isOpen={isRescheduleOpen}
                onClose={() => setIsRescheduleOpen(false)}
                existingData={{
                    ...session,
                    clientName: session.client // mapping client to clientName for modal
                }}
                onSave={(updatedData) => {
                    updateAppointment(updatedData);
                    setIsRescheduleOpen(false);
                    onClose();
                }}
            />
        </Modal>
    );
}
