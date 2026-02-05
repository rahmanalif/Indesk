import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import {
    User,
    FileText,
    ArrowLeft,
    History as HistoryIcon,
    Phone,
    Mail,
    Calendar as CalendarIcon,
    Activity,
    ClipboardCheck
} from 'lucide-react';
import { ClientHistoryModal } from '../../components/modals/ClientHistoryModal';
import { CreateAppointmentModal } from '../../components/modals/CreateAppointmentModal';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useGetClientByIdQuery } from '../../redux/api/clientsApi';
import { cn } from '../../lib/utils';

export function ClientLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: clientResponse, isLoading, isError, error } = useGetClientByIdQuery(id as string, {
    skip: !id,
  });

  const client = useMemo(() => {
    const data = clientResponse?.response?.data;
    if (!data) return null;

    const clinicianUser = data.assignedClinician?.user;
    const clinicianName = clinicianUser
      ? `Dr. ${clinicianUser.firstName} ${clinicianUser.lastName}`.trim()
      : 'Not assigned';

    const statusMap: Record<string, 'Active' | 'Waiting List' | 'Inactive'> = {
      active: 'Active',
      waiting: 'Waiting List',
      inactive: 'Inactive'
    };

    const phone = data.phoneNumber
      ? `${data.countryCode || ''} ${data.phoneNumber}`.trim()
      : '-';

    return {
      id: data.id,
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      phone,
      status: statusMap[data.status] || 'Active',
      clinician: clinicianName,
      rawClient: data
    };
  }, [clientResponse]);

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading client...</div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Error loading client: {(error as any)?.data?.message || 'Unknown error'}
      </div>
    );
  }

  if (!client) return <div className="p-8 text-center text-muted-foreground">Client not found</div>;

    const tabs = [
        { id: 'details', label: 'Details', icon: User, path: `/clients/${id}/details` },
        { id: 'notes', label: 'Clinical Notes', icon: FileText, path: `/clients/${id}/notes` },
        { id: 'assessments', label: 'Assessments', icon: ClipboardCheck, path: `/clients/${id}/assessments` },
        { id: 'measures', label: 'Outcome Measures', icon: Activity, path: `/clients/${id}/measures` },
    ];

    const activeTab = location.pathname.split('/').pop() || 'details';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 w-full">
            {/* Full Width Header Card */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" onClick={() => navigate('/clients')} className="shrink-0 rounded-xl hover:bg-primary/5">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Avatar
                                    fallback={client.name.split(' ').map(n => n[0]).join('')}
                                    size="lg"
                                    className="h-14 w-14 sm:h-20 sm:w-20 text-lg sm:text-xl font-bold bg-primary/10 text-primary border-4 border-white shadow-md shrink-0"
                                />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                                        {client.name}
                                    </h1>
                                    <Badge variant={client.status === 'Active' ? 'success' : 'secondary'} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                        {client.status}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-y-2 gap-x-6 sm:flex-row sm:items-center text-xs sm:text-sm font-medium text-muted-foreground/80">
                                    <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group min-w-0">
                                        <div className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 shrink-0">
                                            <Mail className="h-3.5 w-3.5 text-primary/60" />
                                        </div>
                                        <span className="truncate">{client.email}</span>
                                    </span>
                                    <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group min-w-0">
                                        <div className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 shrink-0">
                                            <Phone className="h-3.5 w-3.5 text-primary/60" />
                                        </div>
                                        <span className="truncate">{client.phone}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center gap-3 w-auto pt-4 lg:pt-0 border-t border-border/40 lg:border-none">
                            <Button
                                variant="outline"
                                onClick={() => setIsHistoryOpen(true)}
                                className="h-10 lg:h-11 px-6 rounded-xl bg-secondary/10 border-primary/5 font-bold text-[10px] uppercase tracking-widest hover:bg-secondary/20 transition-all shrink-0"
                            >
                                <HistoryIcon className="h-4 w-4 mr-2" />
                                History
                            </Button>
                            <Button
                                onClick={() => setIsBookingOpen(true)}
                                className="h-10 lg:h-11 px-6 rounded-xl shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all shrink-0"
                            >
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                Appointment
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Simple Tab Navigation */}
            <div className="flex items-center gap-1 border-b border-border/60 px-2 overflow-x-auto no-scrollbar scroll-smooth">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        to={tab.path}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2.5 text-[11px] sm:text-[13px] font-medium border-b-2 transition-all whitespace-nowrap shrink-0",
                            activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-primary hover:bg-muted/50"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="pt-2">
                <Outlet context={{ client, clientRaw: client.rawClient }} />
            </div>

            <ClientHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                clientName={client.name}
                clientId={client.id}
            />

            <CreateAppointmentModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                fixedClient={{ id: client.id, name: client.name }}
            />
        </div>
    );
}
