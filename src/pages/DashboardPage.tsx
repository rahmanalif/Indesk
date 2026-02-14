import { useState, useMemo, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { useData } from '../context/DataContext';
import { MOCK_CLINICIANS } from '../lib/mockData';
import { Check, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useGetAppointmentsQuery } from '../redux/api/invoiceApi';
import { useGetClinicMembersQuery } from '../redux/api/clientsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Button } from '../components/ui/Button';
const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-100 border-blue-200 text-blue-700',
  scheduled: 'bg-blue-100 border-blue-200 text-blue-700',
  pending: 'bg-purple-100 border-purple-200 text-purple-700',
  completed: 'bg-green-100 border-green-200 text-green-700',
  cancelled: 'bg-gray-100 border-gray-200 text-gray-700',
};

const getLocalDateString = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString('en-CA');
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

const normalizeName = (name?: string) => (name || '').replace(/^Dr\.?\s+/i, '').trim().toLowerCase();

const mergeClinicians = (primary: any[], secondary: any[]) => {
  const map = new Map<string, any>();
  const add = (clinician: any) => {
    if (!clinician) return;
    const keys = [];
    if (clinician.id) keys.push(`id:${clinician.id}`);
    if (clinician.userId) keys.push(`user:${clinician.userId}`);
    if (clinician.name) keys.push(`name:${normalizeName(clinician.name)}`);

    const existing = keys.map(k => map.get(k)).find(Boolean);
    if (existing) {
      existing.avatar = existing.avatar || clinician.avatar;
      existing.role = existing.role || clinician.role;
      existing.status = existing.status || clinician.status;
      existing.userId = existing.userId || clinician.userId;
      existing.name = existing.name || clinician.name;
      keys.forEach(k => map.set(k, existing));
      return;
    }

    const entry = { ...clinician };
    keys.forEach(k => map.set(k, entry));
  };

  primary.forEach(add);
  secondary.forEach(add);

  return Array.from(new Set(map.values()));
};

export function DashboardPage() {
  const { appointments, currentUser } = useData();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [isCliniciansCollapsed, setIsCliniciansCollapsed] = useState(false);

  const {
    data: appointmentsResponse,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    error: appointmentsErrorDetails,
    refetch: refetchAppointments,
  } = useGetAppointmentsQuery({ page: 1, limit: 100 });

  const { data: clinicMembersResponse } = useGetClinicMembersQuery({ page: 1, limit: 100 });

  const clinicMembers = clinicMembersResponse?.response?.data?.docs ?? [];
  const apiClinicians = clinicMembers.map((member: any) => {
    const firstName = member.user?.firstName || '';
    const lastName = member.user?.lastName || '';
    const displayName = [firstName, lastName].filter(Boolean).join(' ');
    return {
      id: member.id,
      userId: member.userId,
      name: displayName ? `Dr. ${displayName}` : 'Clinician',
      role: member.role || 'Clinician',
      status: member.user?.isOnline ? 'Available' : 'Offline',
      avatar: member.user?.avatar,
    };
  });

  const appointmentClinicians = useMemo(() => {
    const docs = appointmentsResponse?.response?.data?.docs ?? [];
    const map = new Map<string, any>();

    docs.forEach((apt: any) => {
      const clinicianUser = apt.clinician?.user;
      const clinicianId = apt.clinicianId || clinicianUser?.id;
      if (!clinicianId) return;

      const firstName = clinicianUser?.firstName || '';
      const lastName = clinicianUser?.lastName || '';
      const displayName = [firstName, lastName].filter(Boolean).join(' ');
      const name = displayName ? `Dr. ${displayName}` : 'Clinician';
      const key = String(clinicianId);

      if (!map.has(key)) {
        map.set(key, {
          id: clinicianId,
          userId: clinicianUser?.id,
          name,
          role: 'Clinician',
          status: 'Available',
          avatar: clinicianUser?.avatar,
        });
      }
    });

    return Array.from(map.values());
  }, [appointmentsResponse]);

  // Default to currentUser's ID if they are a clinician, otherwise null (or keep prev logic)
  // The requirement: "the person logged in as a clinician will have his caledner"
  // "admin will have his calender"
  const [selectedClinicianId, setSelectedClinicianId] = useState<string | number | null>(null);

  const clinicians = useMemo(() => {
    const merged = mergeClinicians(appointmentClinicians, apiClinicians);
    if (merged.length > 0) return merged;
    return MOCK_CLINICIANS;
  }, [appointmentClinicians, apiClinicians]);
  const currentUserName = authUser
    ? [authUser.firstName, authUser.lastName].filter(Boolean).join(' ')
    : currentUser?.name;

  const myClinician = clinicians.find((member: any) => {
    if (authUser?.id && member.userId === authUser.id) return true;
    if (currentUserName && member.name) {
      return normalizeName(member.name) === normalizeName(currentUserName);
    }
    return false;
  });

  useEffect(() => {
    if (selectedClinicianId !== null) return;
    if (myClinician?.id) {
      setSelectedClinicianId(myClinician.id);
      return;
    }
    if (currentUser?.role === 'Clinician' && currentUser?.id) {
      setSelectedClinicianId(currentUser.id);
      return;
    }
    if (clinicians.length > 0) {
      setSelectedClinicianId(clinicians[0].id);
    }
  }, [selectedClinicianId, myClinician, currentUser, clinicians]);

  const apiAppointments = useMemo(() => {
    const docs = appointmentsResponse?.response?.data?.docs ?? [];
    return docs
      .map((apt: any) => {
        const client = apt.client ? `${apt.client.firstName} ${apt.client.lastName}`.trim() : 'Unknown Client';
        const clinicianUser = apt.clinician?.user;
        const clinicianName = clinicianUser
          ? `Dr. ${clinicianUser.firstName} ${clinicianUser.lastName}`.trim()
          : 'Clinician';
        const date = getLocalDateString(apt.startTime);
        const time = getLocalTimeString(apt.startTime);
        if (!date || !time) return null;

        return {
          id: apt.id,
          clientName: client,
          clinician: clinicianName,
          clinicianId: apt.clinicianId || clinicianUser?.id,
          date,
          time,
          duration: getDurationMinutes(apt.startTime, apt.endTime, apt.session?.duration),
          type: apt.session?.name || 'Session',
          status: apt.status || 'pending',
          color: statusColors[apt.status] || statusColors.pending,
          notes: apt.note,
          videoLink: apt.zoomJoinUrl || apt.zoomStartUrl || 'https://zoom.us',
        };
      })
      .filter(Boolean);
  }, [appointmentsResponse]);

  // Filter appointments based on selection
  const filteredAppointments = useMemo(() => {
    const sourceAppointments = apiAppointments.length > 0 ? apiAppointments : appointments;
    if (!selectedClinicianId) return sourceAppointments;

    return sourceAppointments.filter((apt: any) => {
      if (apt.clinicianId) {
        if (String(apt.clinicianId) === String(selectedClinicianId)) {
          return true;
        }
      }
      const clinician = clinicians.find((c: any) => c.id === selectedClinicianId);
      if (!clinician) return false;
      return apt.clinician === clinician.name;
    });
  }, [apiAppointments, appointments, selectedClinicianId, clinicians]);

  const myCalendarId = myClinician?.id ?? currentUser?.id ?? null;
  const isMyCalendarSelected = myCalendarId !== null && String(selectedClinicianId) === String(myCalendarId);
  const showAppointmentsLoading = appointmentsLoading && apiAppointments.length === 0;
  const showAppointmentsError = appointmentsError && apiAppointments.length === 0;

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
            {isCliniciansCollapsed && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            )}
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
        {!isCliniciansCollapsed && (
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {/* My Calendar Option (For Admin mainly, or self) */}
              <button
                onClick={() => myCalendarId && setSelectedClinicianId(myCalendarId)}
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

              {/* Clinician List */}
              {clinicians.map((clinician: any) => {
                // specific logic: don't show "Me" twice if I'm a clinician in the list?
                // The user said "only selected the profile will show the clinicians profile"
                // Let's just list them all.
                const isSelected = selectedClinicianId !== null && String(selectedClinicianId) === String(clinician.id);
                return (
                  <button
                    key={clinician.id}
                    onClick={() => setSelectedClinicianId(clinician.id)}
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
              })}
            </div>
          </CardContent>
        )}
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
          <Calendar filteredAppointments={filteredAppointments} />
        )}
      </div>
    </div>
  );
}
