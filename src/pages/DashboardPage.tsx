import { useState, useMemo } from 'react';
import { Calendar } from '../components/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { useData } from '../context/DataContext';
import { MOCK_CLINICIANS } from '../lib/mockData';
import { Check, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export function DashboardPage() {
  const { appointments, currentUser } = useData();

  // Default to currentUser's ID if they are a clinician, otherwise null (or keep prev logic)
  // The requirement: "the person logged in as a clinician will have his caledner"
  // "admin will have his calender"
  const [selectedClinicianId, setSelectedClinicianId] = useState<number | null>(() => {
    if (!currentUser) return MOCK_CLINICIANS[0].id; // Fallback
    // If Admin (id 999), we might want to show Admin's calendar (no match in MOCK_CLINICIANS)
    // or just let them select. 
    // If Clinician, match their ID.
    return currentUser.role === 'Clinician' ? currentUser.id : 999;
  });

  // Filter appointments based on selection
  const filteredAppointments = useMemo(() => {
    // If Admin (999) is selected (default for admin), show Admin's appointments
    if (selectedClinicianId === 999) {
      return appointments.filter(apt => apt.clinician === 'Admin User' || apt.clinician === currentUser?.name);
    }

    const clinician = MOCK_CLINICIANS.find(c => c.id === selectedClinicianId);
    if (!clinician) return []; // strict filtering

    return appointments.filter(apt => apt.clinician === clinician.name);
  }, [appointments, selectedClinicianId, currentUser]);

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-3rem)] gap-4 pb-4">
      {/* Left Sidebar - Clinician Selector */}
      <Card className="w-full lg:w-64 flex-shrink-0 h-auto max-h-60 lg:max-h-none lg:h-full overflow-hidden flex flex-col border-border/50 shadow-sm order-1">
        <CardHeader className="border-b border-border/50 bg-muted/10 p-3 lg:pb-4">
          <CardTitle className="text-base lg:text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Clinicians
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {/* My Calendar Option (For Admin mainly, or self) */}
            <button
              onClick={() => setSelectedClinicianId(currentUser?.id || 999)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 border",
                selectedClinicianId === (currentUser?.id || 999)
                  ? "bg-primary/5 border-primary/20 shadow-sm"
                  : "hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                selectedClinicianId === (currentUser?.id || 999) ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-transparent"
              )}>
                <Avatar fallback="Me" className="bg-transparent text-inherit" />
              </div>
              <div className="flex-1">
                <p className={cn("font-medium", selectedClinicianId === (currentUser?.id || 999) ? "text-primary" : "text-foreground")}>My Calendar</p>
                <p className="text-xs text-muted-foreground">Personal Schedule</p>
              </div>
              {selectedClinicianId === (currentUser?.id || 999) && <Check className="w-4 h-4 text-primary" />}
            </button>

            <div className="h-px bg-border/50 my-2 mx-2" />

            {/* Clinician List */}
            {MOCK_CLINICIANS.map((clinician) => {
              // specific logic: don't show "Me" twice if I'm a clinician in the list?
              // The user said "only selected the profile will show the clinicians profile"
              // Let's just list them all.
              const isSelected = selectedClinicianId === clinician.id;
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
                      fallback={clinician.name[0]}
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
                      {clinician.role}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </CardContent>
        {/* Footer removed as we don't clear anymore */}
      </Card>

      {/* Main Content - Calendar */}
      <div className="flex-1 h-[600px] lg:h-full overflow-hidden flex flex-col bg-card rounded-xl border border-border/50 shadow-sm order-2">
        <Calendar filteredAppointments={filteredAppointments} />
      </div>
    </div>
  );
}