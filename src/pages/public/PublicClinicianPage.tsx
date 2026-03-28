import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Mail, Phone, Clock, Calendar, Shield, Layers } from 'lucide-react';
import { BookAppointmentModal } from '@/components/modals/BookAppointmentModal';
import { useData } from '../../context/DataContext';
import { useGetPublicClinicQuery, useGetSessionsByClinicianTokenQuery } from '../../redux/api/clientsApi';
import { brandGradient, brandBg } from '../../lib/branding';

const DEFAULT_DAY_SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'];

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export function PublicClinicianPage() {
  const { linkId, id } = useParams();
  const navigate = useNavigate();
  const { branding, sessionTypes: fallbackSessionTypes } = useData();
  const { data: clinicResponse, isLoading, isError } = useGetPublicClinicQuery(linkId || '', {
    skip: !linkId,
  });
  const clinic = clinicResponse?.response?.data;

  const color = clinic?.color || branding.color || '#0066FF';
  const clinicName = clinic?.name || 'Clinic';
  const clinicPhone = `${clinic?.countryCode || ''}${clinic?.phoneNumber || ''}`.trim() || '-';

  const clinicians = useMemo(() => {
    const members = clinic?.members || [];
    return members
      .filter((member: any) => {
        const role = (member?.role || '').toLowerCase();
        return role === 'clinician' || role === 'superadmin' || role === 'admin';
      })
      .map((member: any) => {
        const firstName = member?.user?.firstName || '';
        const lastName = member?.user?.lastName || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Clinician';
        const availabilityDays = Array.isArray(member?.availability) ? member.availability : [];
        const specialization = Array.isArray(member?.specialization) ? member.specialization : [];

        return {
          id: member.id,
          clinicianToken: member?.clinicianToken || '',
          name: `Dr. ${fullName}`.trim(),
          role: roleToLabel(member?.role),
          specialty: specialization.length > 0 ? specialization.join(', ') : 'General Psychology',
          bio: member?.user?.bio || 'Experienced clinician focused on compassionate, evidence-based care.',
          email: member?.user?.email || clinic?.email || '-',
          phone: `${member?.user?.countryCode || ''}${member?.user?.phoneNumber || ''}`.trim() || clinicPhone,
          status: availabilityDays.length > 0 ? 'Available' : 'Offline',
          availability: availabilityDays.map((day: string) => ({
            day: toTitleCase(day),
            slots: DEFAULT_DAY_SLOTS,
          })),
        };
      });
  }, [clinic?.members, clinic?.email, clinicPhone]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedSlot, setPreselectedSlot] = useState<{ date: string; time: string } | null>(null);

  const clinician = clinicians.find((c: any) => String(c.id) === String(id));
  const clinicianToken = clinician?.clinicianToken || '';
  const { data: clinicianSessionsResponse, isLoading: isSessionsLoading } = useGetSessionsByClinicianTokenQuery(clinicianToken, {
    skip: !clinicianToken,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading clinician profile...</div>;
  }

  if (isError || !clinic) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Unable to load clinic data.</div>;
  }

  if (!clinician) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 text-lg">Clinician not found.</p>
          <button onClick={() => navigate(`/clinic-portal/${linkId}`)} className="mt-4 hover:underline text-sm" style={{ color }}>
            Back to clinic
          </button>
        </div>
      </div>
    );
  }

  const availability = clinician.availability || [];
  const parsedApiSessions = useMemo(() => {
    const raw = clinicianSessionsResponse?.response?.data as any;
    const rows = Array.isArray(raw) ? raw : (Array.isArray(raw?.docs) ? raw.docs : []);
    return rows.map((session: any, index: number) => {
      const durationMinutes = Number(session?.duration) || 50;
      const priceNumber = Number(session?.price);
      return {
        id: session?.id || session?._id || `api-session-${index}`,
        name: session?.name || 'Session',
        durationLabel: `${durationMinutes} min`,
        priceLabel: Number.isFinite(priceNumber) && priceNumber >= 0 ? `£${priceNumber}` : (session?.price || '-'),
      };
    });
  }, [clinicianSessionsResponse]);
  const parsedFallbackSessions = useMemo(() => {
    return fallbackSessionTypes.map((session) => ({
      id: session.id,
      name: session.name,
      durationLabel: session.duration || '50 min',
      priceLabel: session.price || '-',
    }));
  }, [fallbackSessionTypes]);
  const sessionOptions = parsedApiSessions.length > 0 ? parsedApiSessions : parsedFallbackSessions;

  const getDayIsoDate = (dayName: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = days.indexOf(dayName);
    let daysUntil = targetDay - todayDay;
    if (daysUntil < 0) daysUntil += 7;
    if (daysUntil === 0) daysUntil = 7;
    const date = new Date(today);
    date.setDate(today.getDate() + daysUntil);
    return date.toISOString().split('T')[0];
  };

  const getDayDate = (dayName: string) => {
    const iso = getDayIsoDate(dayName);
    return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const handleSessionClick = (day: string) => {
    const defaultTime = availability.find((a: any) => a.day === day)?.slots?.[0] || '09:00 AM';
    setPreselectedSlot({ date: getDayIsoDate(day), time: defaultTime });
    setIsBookingOpen(true);
  };

  const statusBadgeStyle = (status: string) => {
    if (status === 'Available') return 'text-green-700 bg-green-50 border-green-200';
    if (status === 'In Session') return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };
  const statusDotColor = (status: string) => {
    if (status === 'Available') return 'bg-green-500';
    if (status === 'In Session') return 'bg-orange-500';
    return 'bg-slate-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: brandGradient(color) }}>
              {clinicName[0]}
            </div>
            <button
              onClick={() => navigate(`/clinic-portal/${linkId}`)}
              className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {clinicName}
            </button>
          </div>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-4 py-2 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-sm"
            style={{ background: color }}
          >
            Book Appointment
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden sticky top-24">
              <div className="h-3" style={{ background: brandGradient(color) }} />
              <div className="p-7 text-center">
                <div className="relative inline-block mb-4">
                  <div className="h-24 w-24 rounded-2xl flex items-center justify-center font-black text-3xl shadow-md mx-auto" style={{ backgroundColor: brandBg(color, 0.12), color }}>
                    {clinician.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${statusDotColor(clinician.status)}`} />
                </div>

                <h1 className="text-xl font-black text-slate-900 mb-1">{clinician.name}</h1>
                <p className="font-bold text-sm mb-3" style={{ color }}>{clinician.role}</p>

                <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-bold mb-4 ${statusBadgeStyle(clinician.status)}`}>
                  <span className={`h-2 w-2 rounded-full ${statusDotColor(clinician.status)}`} />
                  {clinician.status}
                </span>

                <div className="flex justify-center mb-5">
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border" style={{ backgroundColor: brandBg(color, 0.1), color, borderColor: brandBg(color, 0.2) }}>
                    <Star className="h-3 w-3 fill-current" />
                    {clinician.specialty}
                  </div>
                </div>

                <div className="space-y-3 pt-5 border-t border-slate-100 text-sm text-left">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{clinician.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{clinician.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full mt-6 py-3.5 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg text-sm"
                  style={{ background: brandGradient(color) }}
                >
                  Book an Appointment
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color }} />
                About {clinician.name}
              </h2>
              <p className="text-slate-600 leading-relaxed text-[15px]">{clinician.bio}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5" style={{ color }} />
                Available Sessions
              </h2>
              <p className="text-slate-500 text-sm mb-6">Select a day to see available sessions.</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {availability.map((avail: any) => (
                  <button
                    key={avail.day}
                    onClick={() => setSelectedDay(selectedDay === avail.day ? null : avail.day)}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all border"
                    style={
                      selectedDay === avail.day
                        ? { backgroundColor: color, color: '#fff', borderColor: color }
                        : { backgroundColor: '#f8f9fa', color: '#64748b', borderColor: '#e2e8f0' }
                    }
                  >
                    {avail.day}
                    <span className="ml-2 text-[10px] opacity-60 font-normal">{getDayDate(avail.day).split(',')[0].split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>

              {selectedDay ? (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" /> Available sessions - {getDayDate(selectedDay)}
                  </p>
                  {isSessionsLoading && <p className="text-xs text-slate-400 mb-3">Loading sessions...</p>}
                  {sessionOptions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sessionOptions.map((session: any) => (
                        <button
                          key={session.id}
                          onClick={() => handleSessionClick(selectedDay)}
                          className="py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-between gap-3 transition-all border hover:text-white hover:shadow-md"
                          style={{ backgroundColor: brandBg(color, 0.08), color, borderColor: brandBg(color, 0.2) }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = color;
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = brandBg(color, 0.08);
                            e.currentTarget.style.color = color;
                          }}
                        >
                          <span className="flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 shrink-0" />
                            {session.name}
                          </span>
                          <span className="text-xs font-semibold opacity-80">{session.durationLabel} · {session.priceLabel}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No sessions available for this clinician yet.</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: brandBg(color, 0.1) }}>
                    <Calendar className="h-8 w-8 opacity-30" style={{ color }} />
                  </div>
                  <p className="text-slate-500 font-medium">Select a day above to view available sessions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookAppointmentModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setPreselectedSlot(null);
        }}
        clinician={clinician}
        preselectedSlot={preselectedSlot}
        brandColor={color}
      />
    </div>
  );
}

function roleToLabel(role?: string) {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'superadmin') return 'Lead Clinician';
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'clinician') return 'Clinician';
  return 'Clinician';
}
