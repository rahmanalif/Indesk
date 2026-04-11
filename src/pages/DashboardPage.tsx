import { useState, useMemo, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import type { ViewMode } from '../components/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { useData } from '../context/DataContext';
import { Check, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useGetCalendarAppointmentsQuery, useGetClinicMembersQuery } from '../redux/api/clientsApi';
import { Button } from '../components/ui/Button';
const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-100 border-blue-200 text-blue-700',
  scheduled: 'bg-blue-100 border-blue-200 text-blue-700',
  pending: 'bg-purple-100 border-purple-200 text-purple-700',
  completed: 'bg-green-100 border-green-200 text-green-700',
  cancelled: 'bg-gray-100 border-gray-200 text-gray-700',
};

const padDatePart = (value: number) => String(value).padStart(2, '0');

const formatLocalDate = (date: Date) => {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
};

const getLocalDateString = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return formatLocalDate(date);
};

const getLocalTimeString = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getDurationMinutes = (start?: string, end?: string, fallback?: number) => {
  if (start && end) {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (!Number.isNaN(diff) && diff > 0) {
      return Math.round(diff / 60000);
    }
  }
  return fallback ?? 30;
};

const ALL_CALENDARS_KEY = 'all-calendars';

const formatApiDate = (date: Date) => formatLocalDate(date);

const getCalendarRange = (date: Date, view: ViewMode) => {
  if (view === 'day') {
    const day = formatApiDate(date);
    return { startDate: day, endDate: day };
  }

  if (view === 'week') {
    const start = new Date(date);
    const weekday = start.getDay();
    const offset = weekday === 0 ? -6 : 1 - weekday;
    start.setDate(start.getDate() + offset);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      startDate: formatApiDate(start),
      endDate: formatApiDate(end),
    };
  }

  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDate: formatApiDate(start),
    endDate: formatApiDate(end),
  };
};

export function DashboardPage() {
  const [isCliniciansCollapsed, setIsCliniciansCollapsed] = useState(false);
  const [calendarView, setCalendarView] = useState<ViewMode>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarKey, setSelectedCalendarKey] = useState<string>(ALL_CALENDARS_KEY);
  const calendarQueryView: ViewMode = calendarView === 'day' ? 'week' : calendarView;

  const calendarRange = useMemo(
    () => getCalendarRange(calendarDate, calendarQueryView),
    [calendarDate, calendarQueryView]
  );

  const {
    data: appointmentsResponse,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    error: appointmentsErrorDetails,
    refetch: refetchAppointments,
  } = useGetCalendarAppointmentsQuery({
    ...calendarRange,
    view: calendarQueryView,
    clinicianId: selectedCalendarKey === ALL_CALENDARS_KEY ? undefined : selectedCalendarKey,
  });

  const {
    data: clinicMembersResponse,
    isLoading: clinicMembersLoading,
  } = useGetClinicMembersQuery({ page: 1, limit: 100 });

  const clinicMembers = clinicMembersResponse?.response?.data?.docs ?? [];

  const clinicians = useMemo(() => {
    return clinicMembers.map((member: any) => {
      const firstName = member.user?.firstName || '';
      const lastName = member.user?.lastName || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

      return {
        id: String(member.id),
        userId: member.userId,
        name: fullName || member.user?.email || 'Unknown clinician',
        role: member.role || member.user?.role || '',
        status: member.user?.isOnline ? 'Available' : 'Offline',
        avatar: member.user?.avatar,
      };
    });
  }, [clinicMembers]);

  useEffect(() => {
    setSelectedCalendarKey(ALL_CALENDARS_KEY);
  }, []);

  const apiAppointments = useMemo(() => {
    const rawData = appointmentsResponse?.response?.data;
    const docs = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.docs)
        ? rawData.docs
        : Array.isArray(rawData?.events)
          ? rawData.events
        : [];
    return docs
      .map((apt: any) => {
        const client = apt.client ? `${apt.client.firstName} ${apt.client.lastName}`.trim() : 'Unknown Client';
        const clinicianUser = apt.clinician?.user;
        const clinicianName = clinicianUser
          ? `Dr. ${clinicianUser.firstName} ${clinicianUser.lastName}`.trim()
          : 'Clinician';
        const startValue = apt.start || apt.startTime;
        const endValue = apt.end || apt.endTime;
        const date = getLocalDateString(startValue);
        const time = getLocalTimeString(startValue);
        if (!date || !time) return null;

        return {
          id: apt.id,
          clientName: client,
          clinician: clinicianName,
          clinicianId: apt.clinicianId || apt.clinician?.id || clinicianUser?.id,
          startDateTime: startValue,
          endDateTime: endValue,
          date,
          time,
          duration: getDurationMinutes(startValue, endValue, apt.session?.duration),
          type: apt.session?.name || apt.title || 'Session',
          status: apt.status || 'pending',
          color: statusColors[apt.status] || statusColors.pending,
          notes: apt.note,
          videoLink: apt.zoomJoinUrl || apt.zoomStartUrl || 'https://zoom.us',
        };
      })
      .filter(Boolean);
  }, [appointmentsResponse]);

  const isMyCalendarSelected = selectedCalendarKey === ALL_CALENDARS_KEY;
  const showAppointmentsLoading = appointmentsLoading;
  const showAppointmentsError = appointmentsError;

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-3rem)] gap-4 pb-4">
      {/* Left Sidebar - Clinician Selector */}
      <Card className={cn(
        "w-full flex-shrink-0 h-auto max-h-60 lg:max-h-none lg:h-full overflow-hidden flex flex-col border-border/50 shadow-sm order-1 transition-all duration-300",
        isCliniciansCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <CardHeader className="border-b border-border/50 bg-muted/10 p-3 lg:pb-4">
          <div className={cn("flex items-center", isCliniciansCollapsed ? "justify-center" : "justify-between gap-2")}>
            <CardTitle className={cn("text-base lg:text-lg font-semibold flex items-center gap-2", isCliniciansCollapsed && "sr-only")}>
              <Users className="w-5 h-5 text-primary" />
              Clinicians
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsCliniciansCollapsed((prev) => !prev)}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
              aria-label={isCliniciansCollapsed ? "Expand clinicians panel" : "Collapse clinicians panel"}
            >
              {isCliniciansCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {!isCliniciansCollapsed ? (
            <div className="p-2 space-y-1">
              {/* My Calendar Option (For Admin mainly, or self) */}
              <button
                onClick={() => setSelectedCalendarKey(ALL_CALENDARS_KEY)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 border",
                  isMyCalendarSelected
                    ? "bg-primary/5 border-primary/20 shadow-sm"
                    : "hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2",
                  isMyCalendarSelected ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-transparent"
                )}>
                  <Avatar fallback="Me" className="bg-transparent text-inherit" />
                </div>
                <div className="flex-1">
                  <p className={cn("font-medium", isMyCalendarSelected ? "text-primary" : "text-foreground")}>My Calendar</p>
                  <p className="text-xs text-muted-foreground">Personal Schedule</p>
                </div>
                {isMyCalendarSelected && <Check className="w-4 h-4 text-primary" />}
              </button>

              <div className="h-px bg-border/50 my-2 mx-2" />

              {clinicMembersLoading ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">Loading clinicians...</div>
              ) : clinicians.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">No clinicians found.</div>
              ) : (
                clinicians.map((clinician: any) => {
                  const isSelected = selectedCalendarKey === String(clinician.id);
                  return (
                    <button
                      key={clinician.id}
                      onClick={() => setSelectedCalendarKey(String(clinician.id))}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 border group",
                        isSelected
                          ? "bg-primary/5 border-primary/20 shadow-sm"
                          : "hover:bg-muted/50 border-transparent"
                      )}
                    >
                      <div className="relative">
                        <Avatar
                          src={clinician.avatar}
                          alt={clinician.name}
                          fallback={clinician.name?.[0] || 'C'}
                          className={cn(
                            "w-10 h-10 border-2 transition-colors",
                            isSelected ? "border-primary" : "border-transparent group-hover:border-primary/20"
                          )}
                        />
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                          clinician.status === 'Available' ? "bg-emerald-500" :
                            clinician.status === 'In Session' ? "bg-amber-500" : "bg-slate-300"
                        )} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
                          {clinician.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {clinician.role || 'Clinician'}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-2 flex flex-col items-center gap-2">
              <button
                onClick={() => setSelectedCalendarKey(ALL_CALENDARS_KEY)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isMyCalendarSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-muted text-muted-foreground border-transparent hover:border-primary/20"
                )}
                title="My Calendar"
                aria-label="My Calendar"
              >
                <Avatar fallback="Me" className="bg-transparent text-inherit text-xs" />
              </button>

              <div className="h-px w-8 bg-border/60 my-1" />

              {!clinicMembersLoading && clinicians.map((clinician: any) => {
                const isSelected = selectedCalendarKey === String(clinician.id);
                return (
                  <button
                    key={clinician.id}
                    onClick={() => setSelectedCalendarKey(String(clinician.id))}
                    className={cn(
                      "relative rounded-full p-0.5 border-2 transition-colors",
                      isSelected ? "border-primary" : "border-transparent hover:border-primary/20"
                    )}
                    title={clinician.name}
                    aria-label={clinician.name}
                  >
                    <Avatar
                      src={clinician.avatar}
                      alt={clinician.name}
                      fallback={clinician.name?.[0] || 'C'}
                      className="w-10 h-10"
                    />
                    <div className={cn(
                      "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                      clinician.status === 'Available' ? "bg-emerald-500" :
                        clinician.status === 'In Session' ? "bg-amber-500" : "bg-slate-300"
                    )} />
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
        {/* Footer removed as we don't clear anymore */}
      </Card>

      {/* Main Content - Calendar */}
      <div className="flex-1 h-[600px] lg:h-full overflow-hidden flex flex-col bg-card rounded-xl border border-border/50 shadow-sm order-2">
        {showAppointmentsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading appointments...</p>
            </div>
          </div>
        ) : showAppointmentsError ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-red-600 space-y-3">
              <p>Error loading appointments: {(appointmentsErrorDetails as any)?.data?.message || 'Unknown error'}</p>
              <Button variant="outline" size="sm" onClick={() => refetchAppointments()}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <Calendar
            filteredAppointments={apiAppointments}
            onRangeChange={({ currentDate, view }) => {
              setCalendarDate(currentDate);
              setCalendarView(view);
            }}
          />
        )}
      </div>
    </div>
  );
}
