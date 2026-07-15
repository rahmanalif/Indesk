import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Video, Building2, User, Eye, Calendar, Clock, FileText, Mail, Stethoscope, Trash2, CreditCard, Send, Settings2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { notify } from '../components/ui/ToastHost';
import { useGetAppointmentsQuery } from '../redux/api/invoiceApi';
import {
  useUpdateAppointmentStatusMutation,
  useDeleteAppointmentMutation,
  useResendAppointmentPaymentLinkMutation,
} from '../redux/api/clientsApi';

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusVariant = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'completed') return 'success';
  if (s === 'cancelled') return 'destructive';
  if (s === 'scheduled') return 'default';
  return 'warning';
};

const paymentVariant = (status?: string) => {
  if (!status) return 'secondary';
  const s = status.toLowerCase();
  if (s === 'completed') return 'success';
  if (s === 'failed' || s === 'refunded') return 'destructive';
  if (s === 'pending') return 'warning';
  return 'secondary';
};

const paymentLabel = (status?: string, price?: number) => {
  if (!price || price === 0) return 'Free';
  if (!status) return 'Unpaid';
  const s = status.toLowerCase();
  if (s === 'completed') return 'Paid';
  if (s === 'refunded') return 'Refunded';
  if (s === 'failed') return 'Failed';
  return 'Unpaid';
};

const meetingLabel = (type?: string) => {
  const normalized = String(type || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'zoom') return { label: 'Zoom', icon: Video };
  if (normalized === 'google_meet') return { label: 'Google Meet', icon: Video };
  return { label: 'In Person', icon: Building2 };
};

const getMeetingJoinUrl = (apt: any) => {
  const candidates = [
    apt?.zoomJoinUrl,
    apt?.zoomStartUrl,
    apt?.googleMeetJoinUrl,
    apt?.googleMeetStartUrl,
    apt?.googleMeetUrl,
    apt?.googleMeetLink,
    apt?.meetingLink,
    apt?.meetingUrl,
    apt?.joinLink,
    apt?.joinUrl,
    apt?.videoLink,
    apt?.videoUrl,
  ];
  return candidates.find((value) => typeof value === 'string' && value.trim()) || '';
};

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get('clientId') || '';
  const clientName = searchParams.get('clientName') || '';
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isManagingAppointment, setIsManagingAppointment] = useState(false);
  const manageMenuRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const itemsPerPage = 10;

  // Debounce the free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setIsManagingAppointment(false);
  }, [selectedAppointment?.id]);

  useEffect(() => {
    if (!isManagingAppointment) return;
    const closeMenu = (event: MouseEvent) => {
      if (!manageMenuRef.current?.contains(event.target as Node)) {
        setIsManagingAppointment(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [isManagingAppointment]);

  const { data, isLoading, isError, refetch } = useGetAppointmentsQuery(
    {
      page: currentPage,
      limit: itemsPerPage,
      ...(search ? { search } : {}),
      ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
      ...(clientId ? { clientId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
    { pollingInterval: 15000, refetchOnMountOrArgChange: true },
  );

  const [updateAppointmentStatus, { isLoading: isUpdatingStatus }] = useUpdateAppointmentStatusMutation();
  const [deleteAppointment, { isLoading: isDeleting }] = useDeleteAppointmentMutation();
  const [resendPaymentLink, { isLoading: isSendingPaymentLink }] = useResendAppointmentPaymentLinkMutation();

  const appointments = data?.response?.data?.docs || [];
  const totalPages = data?.response?.data?.totalPages || 1;
  const totalDocs = data?.response?.data?.totalDocs || 0;

  const rows = useMemo(
    () =>
      appointments.map((apt) => {
        const start = apt.startTime ? new Date(apt.startTime) : null;
        const end = apt.endTime ? new Date(apt.endTime) : null;
        const duration =
          start && end ? Math.round((end.getTime() - start.getTime()) / 60000) : apt.session?.duration || 0;
        const clinicianUser = apt.clinician?.user;
        return {
          id: apt.id,
          clientId: apt.clientId || apt.client?.id || '',
          clinicianId: apt.clinicianId || '',
          clientName: apt.client ? `${apt.client.firstName} ${apt.client.lastName}`.trim() : 'Unknown',
          clientEmail: apt.client?.email || '',
          clinician: clinicianUser ? `Dr. ${clinicianUser.firstName} ${clinicianUser.lastName}`.trim() : 'Unassigned',
          sessionName: apt.session?.name || 'Session',
          sessionPrice: apt.session?.price ?? 0,
          date: start
            ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '-',
          time: start ? start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '-',
          duration,
          status: apt.status || 'pending',
          meeting: meetingLabel(apt.meetingType),
          isVirtual: String(apt.meetingType || '').toLowerCase().replace(/[\s-]+/g, '_') !== 'in_person',
          meetingUrl: getMeetingJoinUrl(apt),
          note: apt.note || '',
          paymentStatus: apt.transaction?.status ?? null,
        };
      }),
    [appointments],
  );

  const goToClient = (id: string) => {
    if (id) navigate(`/clients/${id}/details`);
  };

  const goToClinician = (id: string) => {
    if (id) navigate(`/clinic/team?clinicianId=${id}`);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAppointmentStatus({ id, status }).unwrap();
      notify.success(`Appointment marked as ${toTitle(status)}.`);
      setSelectedAppointment((prev: any) => (prev && prev.id === id ? { ...prev, status } : prev));
      refetch();
    } catch (error: any) {
      notify.error(error?.data?.message || 'Failed to update appointment status.');
    }
  };

  const handleCancel = (id: string) => {
    if (!window.confirm('Cancel this appointment? The client will be notified.')) return;
    handleStatusChange(id, 'cancelled');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment permanently? This cannot be undone.')) return;
    try {
      await deleteAppointment(id).unwrap();
      notify.success('Appointment deleted.');
      setSelectedAppointment(null);
      refetch();
    } catch (error: any) {
      notify.error(error?.data?.message || 'Failed to delete appointment.');
    }
  };

  const handleResendPaymentLink = async (id: string) => {
    try {
      await resendPaymentLink(id).unwrap();
      notify.success('A new payment link was sent to the client.');
    } catch (error: any) {
      notify.error(error?.data?.message || 'Failed to send payment link.');
    }
  };

  const busy = isUpdatingStatus || isDeleting;

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const clearClientFilter = () => {
    searchParams.delete('clientId');
    searchParams.delete('clientName');
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const hasFilters =
    !!search || statusFilter !== 'All' || !!startDate || !!endDate;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            All booked sessions across the clinic, latest first.
          </p>
        </div>
      </div>

      {clientId && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 text-xs">
            <User className="h-3.5 w-3.5" />
            Filtered by client: <span className="font-semibold">{clientName || 'Selected client'}</span>
            <button
              type="button"
              onClick={clearClientFilter}
              className="ml-1 rounded-full hover:bg-muted/60 p-0.5"
              title="Clear client filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-primary/10 animate-in slide-in-from-top-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <Input
              label="Search"
              placeholder="Search by client name or email..."
              icon={<Search className="h-4 w-4" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-secondary/30 border-none h-11 rounded-xl"
            />
          </div>
          <div className="lg:col-span-2">
            <DatePicker
              label="Start Date"
              date={startDate ? new Date(startDate) : undefined}
              setDate={(d) => {
                setStartDate(d ? d.toISOString().split('T')[0] : '');
                setCurrentPage(1);
              }}
              triggerClassName="h-11 rounded-xl bg-secondary/30 border-none"
            />
          </div>
          <div className="lg:col-span-2">
            <DatePicker
              label="End Date"
              date={endDate ? new Date(endDate) : undefined}
              setDate={(d) => {
                setEndDate(d ? d.toISOString().split('T')[0] : '');
                setCurrentPage(1);
              }}
              triggerClassName="h-11 rounded-xl bg-secondary/30 border-none"
            />
          </div>
          <div className="lg:col-span-2">
            <Select
              label="Status"
              value={statusFilter}
              triggerClassName="h-11 rounded-xl bg-secondary/30 border-none px-4"
              options={STATUS_OPTIONS}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lg:col-span-2">
            <Button
              variant="ghost"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="w-full h-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-[10px] uppercase tracking-widest border border-dashed border-border transition-all"
            >
              Reset All
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading && <div className="text-sm text-muted-foreground">Loading appointments...</div>}
        {isError && <div className="text-sm text-destructive">Failed to load appointments.</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <EmptyState
            title="No Appointments Found"
            description="No appointments match your current filters. Try adjusting the filters above."
          />
        )}

        {!isLoading && !isError && rows.length > 0 && (
          <>
            {/* Desktop Table */}
            <Card className="hidden md:block border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Session</th>
                      <th className="px-6 py-4">Clinician</th>
                      <th className="px-6 py-4">Date &amp; Time</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-white">
                    {rows.map((row) => {
                      const MeetingIcon = row.meeting.icon;
                      return (
                        <tr key={row.id} className="hover:bg-muted/5 transition-colors">
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => goToClient(row.clientId)}
                              disabled={!row.clientId}
                              className="font-medium text-primary hover:underline disabled:text-foreground disabled:no-underline text-left"
                            >
                              {row.clientName}
                            </button>
                            <div className="text-xs text-muted-foreground">{row.clientEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{row.sessionName}</div>
                            <div className="text-xs text-muted-foreground">{row.duration} min</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => goToClinician(row.clinicianId)}
                              disabled={!row.clinicianId}
                              className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline text-left"
                            >
                              {row.clinician}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{row.date}</div>
                            <div className="text-xs text-muted-foreground">{row.time}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <MeetingIcon className="h-3.5 w-3.5" />
                              {row.meeting.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={statusVariant(row.status) as any}>{toTitle(row.status)}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={paymentVariant(row.paymentStatus) as any}>
                              {paymentLabel(row.paymentStatus, row.sessionPrice)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View appointment details"
                              onClick={() => setSelectedAppointment(row)}
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {rows.map((row) => {
                const MeetingIcon = row.meeting.icon;
                return (
                  <Card key={row.id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                       <div>
                        <button
                          type="button"
                          onClick={() => goToClient(row.clientId)}
                          disabled={!row.clientId}
                          className="font-semibold text-primary hover:underline disabled:text-foreground disabled:no-underline text-left"
                        >
                          {row.clientName}
                        </button>
                        <div className="text-xs text-muted-foreground">{row.clientEmail}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={statusVariant(row.status) as any}>{toTitle(row.status)}</Badge>
                        <Badge variant={paymentVariant(row.paymentStatus) as any}>
                          {paymentLabel(row.paymentStatus, row.sessionPrice)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-b border-border/50 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{row.sessionName}</div>
                        <div className="font-medium">{row.date}</div>
                        <div className="text-xs text-muted-foreground">{row.time} · {row.duration} min</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <MeetingIcon className="h-3.5 w-3.5" />
                        {row.meeting.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => goToClinician(row.clinicianId)}
                        disabled={!row.clinicianId}
                        className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                      >
                        {row.clinician}
                      </button>
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSelectedAppointment(row)}>
                        <Eye className="h-3 w-3 mr-2" /> Details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="bg-white px-4 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-border/50 rounded-xl md:rounded-b-xl md:rounded-t-none">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalDocs)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalDocs)}</span> of{' '}
                <span className="font-medium">{totalDocs}</span> results
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
        size="md"
        headerActions={
          <div ref={manageMenuRef} className="relative">
            <Button
              variant={isManagingAppointment ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsManagingAppointment((value) => !value)}
              aria-label="Manage appointment"
              title="Manage appointment"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            {isManagingAppointment && selectedAppointment && (
              <div className="absolute right-0 top-10 z-50 w-72 space-y-3 rounded-lg border border-border bg-background p-4 shadow-xl">
                <p className="text-sm font-semibold">Manage Appointment</p>
                <Select
                  label="Status"
                  value={selectedAppointment.status}
                  disabled={busy}
                  triggerClassName="h-10"
                  options={STATUS_OPTIONS.filter((option) => option.value !== 'All')}
                  onChange={(event) => handleStatusChange(selectedAppointment.id, event.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
                    disabled={busy || selectedAppointment.status === 'cancelled'}
                    onClick={() => handleCancel(selectedAppointment.id)}
                  >
                    <X className="h-4 w-4 mr-1.5" /> Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
                    disabled={busy}
                    onClick={() => handleDelete(selectedAppointment.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        }
      >
        {selectedAppointment && (() => {
          const ModalMeetingIcon = selectedAppointment.meeting.icon;
          return (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={selectedAppointment.clientName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)}
                  size="lg"
                  className="bg-primary/10 text-primary"
                />
                <div>
                  <h3 className="text-lg font-semibold">{selectedAppointment.clientName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.sessionName}</p>
                </div>
              </div>
              <Badge variant={statusVariant(selectedAppointment.status) as any}>
                {toTitle(selectedAppointment.status)}
              </Badge>
            </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Date
                </div>
                <p className="font-medium text-sm">{selectedAppointment.date}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Time
                </div>
                <p className="font-medium text-sm">
                  {selectedAppointment.time} ({selectedAppointment.duration} min)
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5" /> Clinician
                </div>
                <p className="font-medium text-sm">{selectedAppointment.clinician}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ModalMeetingIcon className="h-3.5 w-3.5" /> Type
                </div>
                <p className="font-medium text-sm">{selectedAppointment.meeting.label}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" /> Payment
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={paymentVariant(selectedAppointment.paymentStatus) as any}>
                    {paymentLabel(selectedAppointment.paymentStatus, selectedAppointment.sessionPrice)}
                  </Badge>
                  {selectedAppointment.sessionPrice > 0 &&
                    !['completed', 'refunded'].includes(String(selectedAppointment.paymentStatus || '').toLowerCase()) &&
                    !['cancelled', 'completed'].includes(String(selectedAppointment.status).toLowerCase()) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        isLoading={isSendingPaymentLink}
                        onClick={() => handleResendPaymentLink(selectedAppointment.id)}
                        aria-label="Send payment link again"
                        title="Send payment link again"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> Client Email
                </div>
                <p className="font-medium text-sm break-all">{selectedAppointment.clientEmail || '-'}</p>
              </div>
            </div>

            {selectedAppointment.isVirtual && (
              <Button
                className="w-full h-11"
                disabled={!selectedAppointment.meetingUrl}
                onClick={() => window.open(selectedAppointment.meetingUrl, '_blank', 'noopener,noreferrer')}
              >
                <Video className="h-4 w-4 mr-2" />
                {selectedAppointment.meetingUrl
                  ? `Join ${selectedAppointment.meeting.label} Meeting`
                  : 'Meeting Link Not Available'}
              </Button>
            )}

            {selectedAppointment.note && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> Notes
                </div>
                <p className="text-sm text-foreground bg-muted/20 rounded-lg p-3 border border-border/50">
                  {selectedAppointment.note}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!selectedAppointment.clientId}
                onClick={() => {
                  const id = selectedAppointment.clientId;
                  setSelectedAppointment(null);
                  goToClient(id);
                }}
              >
                <User className="h-4 w-4 mr-2" /> View Client
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={!selectedAppointment.clinicianId}
                onClick={() => {
                  const id = selectedAppointment.clinicianId;
                  setSelectedAppointment(null);
                  goToClinician(id);
                }}
              >
                <Stethoscope className="h-4 w-4 mr-2" /> View Clinician
              </Button>
            </div>
          </div>
          );
        })()}
      </Modal>
    </div>
  );
}
