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
                        ? Back to clinic
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
            {/* Nav */}
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

                    {/* Left – Profile Card */}
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

                    {/* Right – Bio + Availability */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio */}
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

                        {/* Availability */}
                        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
                            <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                                <Calendar className="h-5 w-5" style={{ color }} />
                                Available Time Slots
                            </h2>
                            <p className="text-slate-500 text-sm mb-6">Select a day to see available times. Click a slot to book.</p>

                            {/* Day Tabs */}
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

                            {/* Slots Grid */}
                            {selectedDay ? (
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5" /> Available slots — {getDayDate(selectedDay)}
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
