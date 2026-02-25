import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, ArrowRight, Star, Shield, Clock, Users } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useGetPublicClinicQuery } from '../../redux/api/clientsApi';
import { brandGradient, brandBg } from '../../lib/branding';

const DEFAULT_DAY_SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'];

const normalizeAddress = (address: any) => {
  if (!address) return {};
  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch {
      return {};
    }
  }
  if (typeof address === 'object') return address;
  return {};
};

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export function PublicClinicPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { branding } = useData();
  const { data: clinicResponse, isLoading, isError } = useGetPublicClinicQuery(linkId || '', {
    skip: !linkId,
  });
  const clinic = clinicResponse?.response?.data;

  const apiOrigin = useMemo(() => {
    try {
      return new URL(import.meta.env.VITE_CLIENTS_API_BASE_URL).origin;
    } catch {
      return '';
    }
  }, []);

  const resolveImageUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    if (!apiOrigin) return value;
    if (value.startsWith('/uploads/')) return `${apiOrigin}/public${value}`;
    return `${apiOrigin}${value}`;
  };

  const color = clinic?.color || branding.color || '#0066FF';
  const clinicName = clinic?.name || 'Clinic';
  const clinicLogo = resolveImageUrl(clinic?.logo) || branding.logo;
  const clinicPhone = `${clinic?.countryCode || ''}${clinic?.phoneNumber || ''}`.trim() || '-';
  const clinicEmail = clinic?.email || '-';
  const clinicWebsite = clinic?.url || '#';
  const clinicAddressObject = normalizeAddress(clinic?.address);
  const clinicAddress = [
    clinicAddressObject.street,
    clinicAddressObject.city,
    clinicAddressObject.state,
    clinicAddressObject.zip,
    clinicAddressObject.country,
  ]
    .map((part: string) => (part || '').trim())
    .filter(Boolean)
    .join(', ') || '-';

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
          email: member?.user?.email || clinicEmail,
          phone: `${member?.user?.countryCode || ''}${member?.user?.phoneNumber || ''}`.trim() || clinicPhone,
          status: availabilityDays.length > 0 ? 'Available' : 'Offline',
          availability: availabilityDays.map((day: string) => ({
            day: toTitleCase(day),
            slots: DEFAULT_DAY_SLOTS,
          })),
        };
      });
  }, [clinic?.members, clinicEmail, clinicPhone]);

  const statusColor = (status: string) => {
    if (status === 'Available') return 'bg-green-500';
    if (status === 'In Session') return 'bg-orange-500';
    return 'bg-slate-400';
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading clinic...</div>;
  }

  if (isError || !clinic) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Unable to load clinic details.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinicLogo ? (
              <img src={clinicLogo} alt="Logo" className="h-9 w-9 rounded-xl object-cover shadow-md" />
            ) : (
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                style={{ background: brandGradient(color) }}
              >
                {clinicName[0]}
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">{clinicName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Mental Wellness Clinic</p>
            </div>
          </div>
          <a
            href={clinicPhone !== '-' ? `tel:${clinicPhone}` : undefined}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
            style={{ background: color }}
          >
            <Phone className="h-3.5 w-3.5" />
            Call Us
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: brandGradient(color) }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aDJ2NGg0djJoLTR2NGgtMnYtNGgtNHYtMmg0em0wLTMwVjBoMnY0aDRWNmgtNHY0aC0yVjZoLTRWNGg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-semibold uppercase tracking-widest mb-6">
            <Shield className="h-3.5 w-3.5" /> Trusted Mental Health Care
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">{clinicName}</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            {clinic?.description || 'Expert, compassionate mental health care. Our licensed clinicians are here to help you thrive - book your appointment today.'}
          </p>
          <a
            href="#clinicians"
            className="px-8 py-4 bg-white font-bold rounded-2xl hover:bg-white/90 transition-all shadow-xl inline-flex items-center gap-2 justify-center"
            style={{ color }}
          >
            Meet Our Clinicians <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Phone, label: 'Phone', value: clinicPhone },
            { icon: Mail, label: 'Email', value: clinicEmail },
            { icon: MapPin, label: 'Address', value: clinicAddress },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 flex items-center gap-4 hover:shadow-xl transition-shadow">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: brandBg(color, 0.1), color }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="clinicians" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 border"
            style={{ backgroundColor: brandBg(color, 0.08), color, borderColor: brandBg(color, 0.2) }}
          >
            <Users className="h-3.5 w-3.5" /> Our Team
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Meet Our Clinicians</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Each specialist brings deep expertise and genuine compassion. Click a clinician to view availability and book.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clinicians.map((clinician: any) => (
            <div
              key={clinician.id}
              className="group bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/clinic-portal/${linkId}/clinician/${clinician.id}`)}
            >
              <div className="h-2" style={{ background: brandGradient(color) }} />
              <div className="p-7">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm shrink-0" style={{ backgroundColor: brandBg(color, 0.12), color }}>
                    {clinician.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${statusColor(clinician.status)}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{clinician.name}</h3>
                    <p className="font-semibold text-sm" style={{ color }}>{clinician.role}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-4 border" style={{ backgroundColor: brandBg(color, 0.1), color, borderColor: brandBg(color, 0.2) }}>
                  <Star className="h-3 w-3" />
                  {clinician.specialty}
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">{clinician.bio}</p>

                <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Available Days
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {clinician.availability.map((a: any) => (
                      <span key={a.day} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm">
                        {a.day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full py-3 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:opacity-90" style={{ background: brandGradient(color) }}>
                  View Profile & Book
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Globe className="h-4 w-4" />
            <a href={clinicWebsite} className="hover:underline transition-colors" style={{ color }}>
              {clinicWebsite}
            </a>
          </div>
          <p className="text-slate-400 text-xs">© 2026 {clinicName}. All rights reserved.</p>
        </div>
      </footer>
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
