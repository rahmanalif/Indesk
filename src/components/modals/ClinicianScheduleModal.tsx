import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  User,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { SessionDetailsModal } from './SessionDetailsModal';
import { useGetCalendarAppointmentsQuery } from '../../redux/api/clientsApi';

interface ClinicianScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinician: any;
}

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function ClinicianScheduleModal({
  isOpen,
  onClose,
  clinician,
}: ClinicianScheduleModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const selectedDate = toDateKey(currentDate);
  const { data: calendarResponse, isLoading: isCalendarLoading } =
    useGetCalendarAppointmentsQuery(
      {
        startDate: selectedDate,
        endDate: selectedDate,
        view: 'day',
      },
      { skip: !isOpen || !clinician },
    );

  const calendarRows = useMemo(() => {
    const raw = calendarResponse?.response?.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.docs && Array.isArray(raw.docs)) return raw.docs;
    if (raw?.events && Array.isArray(raw.events)) return raw.events;
    return [];
  }, [calendarResponse]);

  const scheduleRows = useMemo(() => {
    const currentClinicianId = String(clinician?.id || '');

    return calendarRows
      .filter((appointment: any) => {
        if (!currentClinicianId) return true;

        const appointmentClinicianId = String(
          appointment?.clinician?.id ||
            appointment?.clinician?.user?.id ||
            appointment?.clinicianId ||
            '',
        );

        return appointmentClinicianId === currentClinicianId;
      })
      .map((appointment: any) => {
        const startIso = appointment?.startTime || appointment?.start;
        const endIso = appointment?.endTime || appointment?.end;

        const start = startIso ? new Date(startIso) : null;
        const end = endIso ? new Date(endIso) : null;

        const computedMinutes =
          start && end
            ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
            : null;

        const sessionDuration = Number(appointment?.session?.duration);
        const durationMinutes =
          Number.isFinite(sessionDuration) && sessionDuration > 0
            ? sessionDuration
            : computedMinutes && computedMinutes > 0
              ? computedMinutes
              : 0;

        const firstName = appointment?.client?.firstName || '';
        const lastName = appointment?.client?.lastName || '';
        const clientName = `${firstName} ${lastName}`.trim() || 'Unknown Client';

        return {
          id: appointment?.id,
          time: start
            ? start.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '--:--',
          client: clientName,
          type: appointment?.session?.name || appointment?.title || 'Session',
          status: appointment?.status || 'scheduled',
          duration: `${durationMinutes} min`,
          durationMinutes,
          revenue: Number(appointment?.session?.price) || 0,
          source: appointment,
        };
      })
      .sort((a: any, b: any) => {
        if (a.time === '--:--') return 1;
        if (b.time === '--:--') return -1;
        return a.time.localeCompare(b.time);
      });
  }, [calendarRows, clinician?.id]);

  const totalSessions = scheduleRows.length;
  const totalMinutes = scheduleRows.reduce(
    (sum: number, row: any) => sum + row.durationMinutes,
    0,
  );
  const totalHours = (totalMinutes / 60).toFixed(2);
  const totalRevenue = scheduleRows.reduce(
    (sum: number, row: any) => sum + row.revenue,
    0,
  );

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

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (!clinician) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Schedule: ${clinician.name}`} size="lg">
      <div className="flex flex-col gap-6 mt-2">
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

        <div className="space-y-4">
          {isCalendarLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading sessions...</div>
          ) : scheduleRows.length > 0 ? (
            scheduleRows.map((session: any) => (
              <Card
                key={session.id}
                className="p-4 flex items-center gap-4 hover:shadow-sm transition-shadow border-l-4 border-l-primary/50"
              >
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

                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => {
                    setSelectedSession(session);
                    setIsDetailsOpen(true);
                  }}
                >
                  Details
                </Button>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">No sessions scheduled for this day.</div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalHours}h</div>
            <div className="text-xs text-muted-foreground">Hours Booked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Est. Revenue</div>
          </div>
        </div>
      </div>
      <SessionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        session={selectedSession}
      />
    </Modal>
  );
}
