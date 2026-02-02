import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { SessionDetailsModal } from './SessionDetailsModal';

interface ClinicianScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinician: any;
}

export function ClinicianScheduleModal({ isOpen, onClose, clinician }: ClinicianScheduleModalProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    if (!clinician) return null;

    // Mock sessions for the schedule
    const MOCK_SESSIONS = [
        { id: 1, time: '09:00 AM', client: 'Alice Freeman', type: 'Initial Consultation', status: 'confirmed', duration: '60 min' },
        { id: 2, time: '11:30 AM', client: 'Davide B.', type: 'Follow-up', status: 'confirmed', duration: '45 min' },
        { id: 3, time: '02:00 PM', client: 'Sarah Connor', type: 'Therapy Session', status: 'pending', duration: '60 min' },
        { id: 4, time: '04:00 PM', client: 'Mike Ross', type: 'Emergency', status: 'confirmed', duration: '30 min' },
    ];

    const nextDay = () => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() + 1);
        setCurrentDate(next);
    };

    const prevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(currentDate.getDate() - 1);
        setCurrentDate(prev);
    };

    const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Schedule: ${clinician.name}`} size="lg">
            <div className="flex flex-col gap-6 mt-2">

                {/* Date Navigation */}
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border">
                    <Button variant="ghost" size="icon" onClick={prevDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 font-medium">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        {formattedDate}
                    </div>
                    <Button variant="ghost" size="icon" onClick={nextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Schedule Timeline */}
                <div className="space-y-4">
                    {MOCK_SESSIONS.length > 0 ? (
                        MOCK_SESSIONS.map((session) => (
                            <Card key={session.id} className="p-4 flex items-center gap-4 hover:shadow-sm transition-shadow border-l-4 border-l-primary/50">
                                <div className="flex flex-col items-center min-w-[80px]">
                                    <span className="text-lg font-bold text-foreground">{session.time}</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {session.duration}
                                    </span>
                                </div>

                                <div className="h-10 w-px bg-border/50 hidden sm:block"></div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {session.client}
                                        </h4>
                                        <Badge variant={session.status === 'confirmed' ? 'success' : 'secondary'}>
                                            {session.type}
                                        </Badge>
                                    </div>
                                </div>

                                <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => { setSelectedSession(session); setIsDetailsOpen(true); }}>
                                    Details
                                </Button>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No sessions scheduled for this day.
                        </div>
                    )}
                </div>

                {/* Stats Footer */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">4</div>
                        <div className="text-xs text-muted-foreground">Total Sessions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">3.75h</div>
                        <div className="text-xs text-muted-foreground">Hours Booked</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">$520</div>
                        <div className="text-xs text-muted-foreground">Est. Revenue</div>
                    </div>
                </div>

            </div>
            <SessionDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} session={selectedSession} />
        </Modal>
    );
}
