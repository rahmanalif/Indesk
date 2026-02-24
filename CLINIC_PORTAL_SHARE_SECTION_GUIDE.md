# Clinic Share + Public Portal Section (Full Copy Guide)

This guide is for rebuilding the exact frontend section you showed:
- `Share Clinic` popup in Clinic page
- public portal page: `/clinic-portal/:linkId`
- clinician profile page: `/clinic-portal/:linkId/clinician/:id`
- booking modal handoff

Use this as a manual merge checklist while moving code from the zip into your main project.

## 1) File Map (all related)

- `src/pages/clinic/ClinicLayout.tsx`
- `src/context/DataContext.tsx`
- `src/App.tsx`
- `src/pages/public/PublicClinicPage.tsx`
- `src/pages/public/PublicClinicianPage.tsx`
- `src/components/modals/BookAppointmentModal.tsx`
- `src/lib/mockData.ts`
- `src/lib/branding.ts`
- `src/pages/clinic/CliniciansPage.tsx` (same data dependency)
- `src/pages/clinic/ClinicDetailsPage.tsx` (same data dependency)

---

## 2) Routing setup (`src/App.tsx`)

Add imports:

```tsx
import { PublicClinicPage } from './pages/public/PublicClinicPage';
import { PublicClinicianPage } from './pages/public/PublicClinicianPage';
```

Add routes:

```tsx
{/* Public Clinic Portal (no auth required) */}
<Route path="/clinic-portal/:linkId" element={<PublicClinicPage />} />
<Route path="/clinic-portal/:linkId/clinician/:id" element={<PublicClinicianPage />} />
```

---

## 3) DataContext additions (`src/context/DataContext.tsx`)

### 3.1 Context type fields

```tsx
// Public Share Link
clinicShareLink: string | null;
generateShareLink: () => string;
addPublicBooking: (info: {
  name: string;
  email: string;
  phone: string;
  clinicianName: string;
  date: string;
  time: string;
  sessionType: string;
  duration?: number;
  invoiceNumber?: string;
}) => void;
```

### 3.2 State

```tsx
const [clinicShareLink, setClinicShareLink] = useState<string | null>(() => {
  return localStorage.getItem('clinic_share_link');
});
```

### 3.3 Share link function

```tsx
const generateShareLink = () => {
  const token =
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10);
  setClinicShareLink(token);
  localStorage.setItem('clinic_share_link', token);
  return token;
};
```

### 3.4 Public booking function

```tsx
const addPublicBooking = (info: {
  name: string;
  email: string;
  phone: string;
  clinicianName: string;
  date: string;
  time: string;
  sessionType: string;
  duration?: number;
  invoiceNumber?: string;
}) => {
  const newClientId = Math.max(...clients.map(c => c.id), 0) + 1;
  const newClient: Client = {
    id: newClientId,
    name: info.name,
    email: info.email,
    phone: info.phone,
    address: 'Not provided',
    status: 'Active',
    nextApt: `${info.date}, ${info.time}`,
    clinician: info.clinicianName,
    gpName: '-',
    insurance: '-',
  };
  setClients(prev => [...prev, newClient]);

  const newApt = {
    clientName: info.name,
    clientId: newClientId,
    clinician: info.clinicianName,
    date: info.date,
    time: info.time,
    duration: info.duration || 50,
    type: info.sessionType,
    status: 'pending' as const,
    color: 'bg-blue-100 border-blue-200 text-blue-700',
    notes: `Booked via public portal.${info.invoiceNumber ? ` Invoice: ${info.invoiceNumber}` : ''}`,
  };
  setAppointments(prev => [...prev, { ...newApt, id: Math.max(...prev.map(a => a.id), 0) + 1 }]);
};
```

### 3.5 Provider value

```tsx
clinicShareLink,
generateShareLink,
addPublicBooking,
```

---

## 4) Share popup UI (`src/pages/clinic/ClinicLayout.tsx`)

Use this exact component:

```tsx
import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Building2, Users, Share2, Copy, CheckCheck, ExternalLink, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function ClinicLayout() {
  const { clinicShareLink, generateShareLink } = useData();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!clinicShareLink) {
      generateShareLink();
    }
    setShowSharePopup(true);
  };

  const getShareUrl = () => {
    const token = clinicShareLink || '';
    return `${window.location.origin}/clinic-portal/${token}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinic Management</h1>
          <p className="text-muted-foreground">Manage your clinic settings, clinicians, and team members.</p>
        </div>

        <div className="relative">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-md whitespace-nowrap"
          >
            <Share2 className="h-4 w-4" />
            Share Clinic
          </button>

          {showSharePopup && (
            <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-popover border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 flex items-center justify-between bg-primary">
                <div>
                  <p className="text-white font-bold text-sm">Share Your Clinic</p>
                  <p className="text-white/70 text-xs mt-0.5">Anyone with this link can view & book</p>
                </div>
                <button onClick={() => setShowSharePopup(false)} className="text-white/70 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl p-3">
                  <p className="flex-1 text-xs text-muted-foreground font-mono truncate">{getShareUrl()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary text-white hover:bg-primary/90'}`}
                  >
                    {copied ? <><CheckCheck className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Link</>}
                  </button>
                  <a
                    href={getShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Patients can view clinician profiles and book appointments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSharePopup && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSharePopup(false)} />
      )}

      <div className="border-b border-border/50">
        <div className="flex items-center gap-1">
          <NavLink
            to="/clinic/details"
            className={({ isActive }) => `
              flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all
              ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
            `}
          >
            <Building2 className="h-4 w-4" />
            Clinic Details
          </NavLink>
          <NavLink
            to="/clinic/team"
            className={({ isActive }) => `
              flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all
              ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
            `}
          >
            <Users className="h-4 w-4" />
            Clinicians & Team
          </NavLink>
        </div>
      </div>

      <div className="min-h-[400px]">
        <Outlet />
      </div>
    </div>
  );
}
```

---

## 5) Public clinic page (`src/pages/public/PublicClinicPage.tsx`)

Keep your existing file same as zip version. This page must:
- read `linkId` from `useParams()`
- render clinicians from `MOCK_CLINICIANS` (or API data)
- navigate to `/clinic-portal/${linkId}/clinician/${clinician.id}`

Critical click code:

```tsx
onClick={() => navigate(`/clinic-portal/${linkId}/clinician/${clinician.id}`)}
```

---

## 6) Public clinician page (`src/pages/public/PublicClinicianPage.tsx`)

Use this component:

```tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Mail, Phone, Clock, Calendar, CheckCircle, Shield } from 'lucide-react';
import { MOCK_CLINICIANS, MOCK_CLINIC_DETAILS } from '../../lib/mockData';
import { BookAppointmentModal } from '@/components/modals/BookAppointmentModal';
import { useData } from '../../context/DataContext';

import { brandGradient, brandBg } from '../../lib/branding';

export function PublicClinicianPage() {
  const { linkId, id } = useParams();
  const navigate = useNavigate();
  const { branding } = useData();
  const color = branding.color || '#0066FF';

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedSlot, setPreselectedSlot] = useState<{ date: string; time: string } | null>(null);

  const clinician = MOCK_CLINICIANS.find(c => c.id === Number(id));

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

  const availability = (clinician as any).availability || [];

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
    return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const handleSlotClick = (day: string, slot: string) => {
    setPreselectedSlot({ date: getDayIsoDate(day), time: slot });
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
            {branding.logo ? (
              <img src={branding.logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                style={{ background: brandGradient(color) }}>
                {MOCK_CLINIC_DETAILS.name[0]}
              </div>
            )}
            <button
              onClick={() => navigate(`/clinic-portal/${linkId}`)}
              className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {MOCK_CLINIC_DETAILS.name}
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
                  <div className="h-24 w-24 rounded-2xl flex items-center justify-center font-black text-3xl shadow-md mx-auto"
                    style={{ backgroundColor: brandBg(color, 0.12), color }}>
                    {clinician.name.split(' ').map((n: string) => n[0]).join('')}
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
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border"
                    style={{ backgroundColor: brandBg(color, 0.1), color, borderColor: brandBg(color, 0.2) }}>
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

              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
                {[
                  { value: `${clinician.clients}+`, label: 'Active Clients' },
                  { value: '5.0', label: 'Avg. Rating' },
                  { value: '10+', label: 'Years Exp.' },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-2xl" style={{ backgroundColor: brandBg(color, 0.07) }}>
                    <div className="text-2xl font-black" style={{ color }}>{s.value}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5" style={{ color }} />
                Available Time Slots
              </h2>
              <p className="text-slate-500 text-sm mb-6">Select a day to see available times. Click a slot to book.</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {availability.map((avail: any) => (
                  <button
                    key={avail.day}
                    onClick={() => setSelectedDay(selectedDay === avail.day ? null : avail.day)}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all border"
                    style={selectedDay === avail.day
                      ? { backgroundColor: color, color: '#fff', borderColor: color }
                      : { backgroundColor: '#f8f9fa', color: '#64748b', borderColor: '#e2e8f0' }}
                  >
                    {avail.day}
                    <span className="ml-2 text-[10px] opacity-60 font-normal">{getDayDate(avail.day).split(',')[0].split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>

              {selectedDay ? (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Available slots - {getDayDate(selectedDay)}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availability.find((a: any) => a.day === selectedDay)?.slots.map((slot: string) => (
                      <button
                        key={slot}
                        onClick={() => handleSlotClick(selectedDay, slot)}
                        className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all border hover:text-white hover:shadow-md"
                        style={{ backgroundColor: brandBg(color, 0.08), color, borderColor: brandBg(color, 0.2) }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = color; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = brandBg(color, 0.08); (e.currentTarget as HTMLButtonElement).style.color = color; }}
                      >
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: brandBg(color, 0.1) }}>
                    <Calendar className="h-8 w-8 opacity-30" style={{ color }} />
                  </div>
                  <p className="text-slate-500 font-medium">Select a day above to view available time slots</p>
                  <p className="text-slate-400 text-sm mt-1">All times shown in your local timezone</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookAppointmentModal
        isOpen={isBookingOpen}
        onClose={() => { setIsBookingOpen(false); setPreselectedSlot(null); }}
        clinician={clinician}
        preselectedSlot={preselectedSlot}
      />
    </div>
  );
}
```

---

## 7) Branding helper (`src/lib/branding.ts`)

```ts
export function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function brandGradient(color: string) {
  const { r, g, b } = hexToRgb(color.startsWith('#') ? color : '#0066FF');
  const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;
  return `linear-gradient(135deg, ${color} 0%, ${darker} 100%)`;
}

export function brandBg(color: string, opacity = 0.08) {
  const { r, g, b } = hexToRgb(color.startsWith('#') ? color : '#0066FF');
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
```

---

## 8) Mock data required (`src/lib/mockData.ts`)

At minimum you need these:
- `MOCK_CLINIC_DETAILS`
- `MOCK_CLINICIANS` (with `availability`)
- `SESSION_TYPES` (used by booking modal)

If your API already exists, keep this structure in API response so UI does not break:

```ts
type Clinician = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  clients: number;
  status: 'Available' | 'In Session' | 'Offline';
  specialty: string;
  bio: string;
  availability: { day: string; slots: string[] }[];
};
```

---

## 9) Booking modal integration (`src/components/modals/BookAppointmentModal.tsx`)

The page relies on this existing contract:

```tsx
export interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinician: any;
  preselectedSlot?: { date: string; time: string } | null;
}
```

And inside modal:

```tsx
const { addPublicBooking, branding, sessionTypes } = useData();
```

Booking submit must call:

```tsx
addPublicBooking({
  name: form.name,
  email: form.email,
  phone: form.phone,
  clinicianName: clinician.name,
  date: selectedDate,
  time: selectedTime,
  sessionType: selectedSessionTypeName,
  duration: selectedDuration,
  invoiceNumber,
});
```

---

## 10) If your main project already has API

Current zip version is frontend-first and mostly local state/mock based.

To connect your API without breaking UI:

1. Replace `generateShareLink()` internals with `POST /clinic/share-link` response token.
2. Keep `getShareUrl()` format unchanged: `${origin}/clinic-portal/${token}`.
3. In public pages, use `linkId` to fetch clinic + clinicians (instead of mock arrays).
4. Keep same data shape in response.
5. Replace `addPublicBooking` local state with `POST /public/bookings`.

---

## 11) Final manual checklist

- [ ] `App.tsx` has 2 public routes.
- [ ] `ClinicLayout.tsx` has Share popup and preview link.
- [ ] `DataContext.tsx` has `clinicShareLink`, `generateShareLink`, `addPublicBooking`.
- [ ] `PublicClinicPage.tsx` clinician card click navigates with `linkId`.
- [ ] `PublicClinicianPage.tsx` opens `BookAppointmentModal`.
- [ ] `BookAppointmentModal` uses `addPublicBooking`.
- [ ] `branding.ts` helper exists.
- [ ] `mockData.ts` fields match expected UI shape (or API returns same).

If you want, next step I can generate a second file:
- `CLINIC_PORTAL_API_MAPPING.md`
with exact API request/response contracts so your backend integration is direct.
