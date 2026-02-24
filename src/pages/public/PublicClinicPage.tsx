import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, ArrowRight, Star, Shield, Clock, Users } from 'lucide-react';
import { MOCK_CLINIC_DETAILS, MOCK_CLINICIANS } from '../../lib/mockData';
import { useData } from '../../context/DataContext';

import { brandGradient, brandBg } from '../../lib/branding';

export function PublicClinicPage() {
    const { linkId } = useParams();
    const navigate = useNavigate();
    const { branding } = useData();
    const color = branding.color || '#0066FF';

    const statusColor = (status: string) => {
        if (status === 'Available') return 'bg-green-500';
        if (status === 'In Session') return 'bg-orange-500';
        return 'bg-slate-400';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Sticky Nav Bar */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {branding.logo ? (
                            <img src={branding.logo} alt="Logo" className="h-9 w-9 rounded-xl object-cover shadow-md" />
                        ) : (
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                                style={{ background: brandGradient(color) }}>
                                {MOCK_CLINIC_DETAILS.name[0]}
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{MOCK_CLINIC_DETAILS.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Mental Wellness Clinic</p>
                        </div>
                    </div>
                    <a
                        href={`tel:${MOCK_CLINIC_DETAILS.phone}`}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
                        style={{ background: color }}
                    >
                        <Phone className="h-3.5 w-3.5" />
                        Call Us
                    </a>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: brandGradient(color) }} />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aDJ2NGg0djJoLTR2NGgtMnYtNGgtNHYtMmg0em0wLTMwVjBoMnY0aDRWNmgtNHY0aC0yVjZoLTRWNGg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-semibold uppercase tracking-widest mb-6">
                        <Shield className="h-3.5 w-3.5" /> Trusted Mental Health Care
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                        {MOCK_CLINIC_DETAILS.name}
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                        Expert, compassionate mental health care. Our licensed clinicians are here to help you thrive - book your appointment today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#clinicians"
                            className="px-8 py-4 bg-white font-bold rounded-2xl hover:bg-white/90 transition-all shadow-xl flex items-center gap-2 justify-center"
                            style={{ color }}>
                            Meet Our Clinicians <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 max-w-lg mx-auto gap-6 mt-16">
                        {[
                            { value: '3+', label: 'Specialists' },
                            { value: '50+', label: 'Active Clients' },
                            { value: '5?', label: 'Patient Rating' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-3xl font-black text-white">{s.value}</div>
                                <div className="text-white/60 text-xs font-medium mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Info Cards */}
            <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Phone, label: 'Phone', value: MOCK_CLINIC_DETAILS.phone },
                        { icon: Mail, label: 'Email', value: MOCK_CLINIC_DETAILS.email },
                        { icon: MapPin, label: 'Address', value: MOCK_CLINIC_DETAILS.address },
                    ].map(item => (
                        <div key={item.label} className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 flex items-center gap-4 hover:shadow-xl transition-shadow">
                            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: brandBg(color, 0.1), color }}>
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

            {/* Clinicians */}
            <section id="clinicians" className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 border"
                        style={{ backgroundColor: brandBg(color, 0.08), color, borderColor: brandBg(color, 0.2) }}>
                        <Users className="h-3.5 w-3.5" /> Our Team
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Meet Our Clinicians</h2>
                    <p className="text-slate-500 mt-3 max-w-xl mx-auto">Each specialist brings deep expertise and genuine compassion. Click a clinician to view availability and book.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_CLINICIANS.map(clinician => (
                        <div key={clinician.id}
                            className="group bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(`/clinic-portal/${linkId}/clinician/${clinician.id}`)}
                        >
                            {/* Top brand bar */}
                            <div className="h-2" style={{ background: brandGradient(color) }} />

                            <div className="p-7">
                                {/* Avatar */}
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="relative h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm shrink-0"
                                        style={{ backgroundColor: brandBg(color, 0.12), color }}>
                                        {clinician.name.split(' ').map((n: string) => n[0]).join('')}
                                        <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${statusColor(clinician.status)}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{clinician.name}</h3>
                                        <p className="font-semibold text-sm" style={{ color }}>{clinician.role}</p>
                                    </div>
                                </div>

                                {/* Specialty badge */}
                                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-4 border"
                                    style={{ backgroundColor: brandBg(color, 0.1), color, borderColor: brandBg(color, 0.2) }}>
                                    <Star className="h-3 w-3" />
                                    {clinician.specialty}
                                </div>

                                <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">{clinician.bio}</p>

                                {/* Availability Preview */}
                                <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" /> Available Days
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(clinician as any).availability?.map((a: any) => (
                                            <span key={a.day} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm">
                                                {a.day.slice(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className="w-full py-3 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:opacity-90"
                                    style={{ background: brandGradient(color) }}
                                >
                                    View Profile & Book
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm mt-8">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Globe className="h-4 w-4" />
                        <a href={MOCK_CLINIC_DETAILS.website} className="hover:underline transition-colors" style={{ color }}>{MOCK_CLINIC_DETAILS.website}</a>
                    </div>
                    <p className="text-slate-400 text-xs">© 2026 {MOCK_CLINIC_DETAILS.name}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
