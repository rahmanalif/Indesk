
import { useState, useEffect, useMemo, useRef } from 'react';
import {
    X, User, Calendar, CheckCircle, ChevronRight, Clock,
    ArrowLeft, Phone, Mail, Loader2, Layers, Send, Printer
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { MOCK_CLINIC_DETAILS } from '../../lib/mockData';
import { hexToRgb, brandGradient, brandBg } from '../../lib/branding';
import { useGetSessionsByClinicianTokenQuery } from '../../redux/api/clientsApi';

export interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinician: any;
    preselectedSlot?: { date: string; time: string } | null;
    brandColor?: string;
}

type Step = 1 | 2 | 3 | 4;



// --- Invoice number generator -------------------------------------------------
function generateInvoiceNumber() {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${ymd}-${rand}`;
}

// --- PDF/Print window ---------------------------------------------------------
function openPrintInvoice(opts: {
    invoiceNumber: string;
    patientName: string;
    email: string;
    phone: string;
    clinicianName: string;
    sessionName: string;
    duration: string;
    price: string;
    date: string;
    time: string;
    clinicName: string;
    clinicPhone: string;
    clinicEmail: string;
    clinicAddress: string;
    brandColor: string;
    logoDataUrl: string | null;
}) {
    const { r, g, b } = hexToRgb(opts.brandColor.startsWith('#') ? opts.brandColor : '#0066FF');
    const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;
    const gradient = `linear-gradient(135deg, ${opts.brandColor} 0%, ${darker} 100%)`;
    const dateLabel = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const logoHtml = opts.logoDataUrl
        ? `<img src="${opts.logoDataUrl}" style="height:48px;width:48px;object-fit:cover;border-radius:12px;" />`
        : `<div style="height:48px;width:48px;border-radius:12px;background:${gradient};display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;">${opts.clinicName[0]}</div>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${opts.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f8fafc;color:#0f172a;padding:40px 20px;min-height:100vh}
    .page{max-width:680px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}
    .header{padding:36px 40px;background:${gradient};color:#fff}
    .header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}
    .logo-row{display:flex;align-items:center;gap:14px}
    .clinic-name{font-size:18px;font-weight:800;line-height:1.2}
    .clinic-sub{font-size:11px;color:rgba(255,255,255,0.7);font-weight:500;text-transform:uppercase;letter-spacing:0.08em}
    .inv-badge{text-align:right}
    .inv-label{font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.1em}
    .inv-number{font-size:20px;font-weight:900;margin-top:2px}
    .inv-date{font-size:12px;color:rgba(255,255,255,0.65);margin-top:4px}
    .status-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);border-radius:99px;padding:6px 16px;font-size:12px;font-weight:700}
    .dot{width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block}
    .body{padding:36px 40px}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:32px}
    .col-title{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;font-weight:700;margin-bottom:10px}
    .col-val{font-size:14px;font-weight:600;color:#1e293b;margin-bottom:4px}
    .col-val-sm{font-size:13px;color:#475569;margin-bottom:3px}
    .divider{border:none;border-top:1px solid #f1f5f9;margin:24px 0}
    .items-table{width:100%;border-collapse:collapse;margin-bottom:28px}
    .items-table th{font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-weight:700;padding:8px 12px;text-align:left;background:#f8fafc;border-radius:6px}
    .items-table td{padding:14px 12px;font-size:14px;color:#334155;border-bottom:1px solid #f1f5f9}
    .items-table td:last-child{text-align:right;font-weight:700;color:#1e293b}
    .total-row{display:flex;justify-content:flex-end;margin-top:8px}
    .total-box{background:${opts.brandColor}10;border:1.5px solid ${opts.brandColor}30;border-radius:14px;padding:16px 24px;min-width:220px}
    .total-line{display:flex;justify-content:space-between;font-size:13px;color:#64748b;margin-bottom:6px}
    .total-line.big{font-size:16px;font-weight:800;color:#0f172a;margin-top:10px;padding-top:10px;border-top:1px solid ${opts.brandColor}30}
    .footer{padding:24px 40px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center}
    .footer p{font-size:12px;color:#94a3b8;line-height:1.8}
    .footer a{color:${opts.brandColor};text-decoration:none;font-weight:600}
    @media print{
      body{background:#fff;padding:0}
      .page{box-shadow:none;border-radius:0;max-width:100%}
      .no-print{display:none!important}
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:20px">
    <button onclick="window.print()" style="background:${gradient};color:#fff;border:none;padding:12px 32px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
      ??? Print / Save as PDF
    </button>
  </div>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div class="logo-row">
          ${logoHtml}
          <div>
            <div class="clinic-name">${opts.clinicName}</div>
            <div class="clinic-sub">Appointment Invoice</div>
          </div>
        </div>
        <div class="inv-badge">
          <div class="inv-label">Invoice</div>
          <div class="inv-number">${opts.invoiceNumber}</div>
          <div class="inv-date">${dateLabel}</div>
        </div>
      </div>
      <div class="status-badge"><span class="dot"></span> Confirmed</div>
    </div>

    <div class="body">
      <div class="two-col">
        <div>
          <div class="col-title">Billed To</div>
          <div class="col-val">${opts.patientName}</div>
          <div class="col-val-sm">${opts.email}</div>
          <div class="col-val-sm">${opts.phone}</div>
        </div>
        <div>
          <div class="col-title">Clinic Details</div>
          <div class="col-val">${opts.clinicName}</div>
          <div class="col-val-sm">${opts.clinicEmail}</div>
          <div class="col-val-sm">${opts.clinicPhone}</div>
          <div class="col-val-sm" style="font-size:12px">${opts.clinicAddress}</div>
        </div>
      </div>

      <hr class="divider"/>

      <table class="items-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Clinician</th>
            <th>Date & Time</th>
            <th>Duration</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${opts.sessionName}</strong></td>
            <td>${opts.clinicianName}</td>
            <td>${opts.date}<br/><span style="font-size:12px;color:#94a3b8">${opts.time}</span></td>
            <td>${opts.duration}</td>
            <td>${opts.price}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-row">
        <div class="total-box">
          <div class="total-line"><span>Subtotal</span><span>${opts.price}</span></div>
          <div class="total-line"><span>Tax (0%)</span><span>$0.00</span></div>
          <div class="total-line big"><span>Total Due</span><span>${opts.price}</span></div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing <strong>${opts.clinicName}</strong>.<br/>
      Questions? Contact us at <a href="mailto:${opts.clinicEmail}">${opts.clinicEmail}</a> or <a href="tel:${opts.clinicPhone}">${opts.clinicPhone}</a></p>
    </div>
  </div>
  <script>
    // Small delay so fonts load before auto-showing print dialog
    // Remove the line below if you don't want auto-print
    // setTimeout(() => window.print(), 800);
  <\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=780,height=900');
    if (win) {
        win.document.write(html);
        win.document.close();
    }
}

// --- Component ----------------------------------------------------------------
export function BookAppointmentModal({ isOpen, onClose, clinician, preselectedSlot, brandColor }: BookAppointmentModalProps) {
    const { addPublicBooking, branding, sessionTypes: fallbackSessionTypes } = useData();
    const color = brandColor || branding.color || '#0066FF';

    const [step, setStep] = useState<Step>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const invoiceRef = useRef<string>(generateInvoiceNumber());

    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const availability = clinician?.availability || [];
    const clinicianToken = clinician?.clinicianToken || '';
    const { data: clinicianSessionsResponse, isLoading: isSessionsLoading } = useGetSessionsByClinicianTokenQuery(clinicianToken, {
        skip: !clinicianToken || !isOpen,
    });

    const parsedApiSessions = useMemo(() => {
        const raw = clinicianSessionsResponse?.response?.data as any;
        const rows = Array.isArray(raw) ? raw : (Array.isArray(raw?.docs) ? raw.docs : []);
        return rows.map((session: any, index: number) => {
            const durationMinutes = Number(session?.duration) || 50;
            const priceNumber = Number(session?.price);
            return {
                id: session?.id || session?._id || `api-session-${index}`,
                name: session?.name || 'Session',
                durationMinutes,
                durationLabel: `${durationMinutes} min`,
                priceLabel: Number.isFinite(priceNumber) && priceNumber >= 0 ? `$${priceNumber}` : (session?.price || '-'),
            };
        });
    }, [clinicianSessionsResponse]);

    const parsedFallbackSessions = useMemo(() => {
        return fallbackSessionTypes.map((session) => {
            const durationMatch = String(session.duration || '').match(/\d+/);
            const durationMinutes = durationMatch ? Number(durationMatch[0]) : 50;
            return {
                id: session.id,
                name: session.name,
                durationMinutes,
                durationLabel: session.duration || `${durationMinutes} min`,
                priceLabel: session.price || '-',
            };
        });
    }, [fallbackSessionTypes]);

    const sessionOptions = parsedApiSessions.length > 0 ? parsedApiSessions : parsedFallbackSessions;
    const selectedSession = sessionOptions.find((s) => String(s.id) === String(selectedSessionId));

    const getDayIsoDate = (dayName: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const targetDay = days.indexOf(dayName);
        let daysUntil = targetDay - today.getDay();
        if (daysUntil < 0) daysUntil += 7;
        if (daysUntil === 0) daysUntil = 7;
        const date = new Date(today);
        date.setDate(today.getDate() + daysUntil);
        return date.toISOString().split('T')[0];
    };

    const getDayFormatted = (dayName: string) => {
        const iso = getDayIsoDate(dayName);
        return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    useEffect(() => {
        if (preselectedSlot && isOpen) {
            const matchedDay = availability.find((a: any) => getDayIsoDate(a.day) === preselectedSlot.date);
            if (matchedDay) {
                setSelectedDay(matchedDay.day);
                setSelectedSlot(preselectedSlot.time);
                setStep(2);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedSlot, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep(1);
                setFormData({ firstName: '', lastName: '', email: '', phone: '' });
                setSelectedDay(null); setSelectedSlot(null); setSelectedSessionId(null);
                setErrors({}); setEmailSent(false);
                invoiceRef.current = generateInvoiceNumber();
            }, 300);
        }
    }, [isOpen]);

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!formData.firstName.trim()) e.firstName = 'First name is required.';
        if (!formData.lastName.trim()) e.lastName = 'Last name is required.';
        if (!formData.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Enter a valid email.';
        if (!formData.phone.trim()) e.phone = 'Phone number is required.';
        setErrors(e); return Object.keys(e).length === 0;
    };
    const validateStep2 = () => {
        const e: Record<string, string> = {};
        if (!selectedDay) e.slot = 'Please select a day.';
        if (!selectedSessionId) e.session = 'Please select a session type.';
        setErrors(e);
        if (Object.keys(e).length > 0) return false;
        setErrors({}); return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const handleConfirm = () => {
        setIsLoading(true);
        setTimeout(() => {
            const rawTime = selectedSlot || '09:00 AM';
            const [timePart, period] = rawTime.split(' ');
            const [h, m] = timePart.split(':');
            let hour = parseInt(h);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            const isoTime = `${String(hour).padStart(2, '0')}:${m || '00'}`;

            const resolvedDuration = selectedSession?.durationMinutes || 50;

            addPublicBooking({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                clinicianName: clinician.name,
                date: getDayIsoDate(selectedDay!),
                time: isoTime,
                sessionType: selectedSession?.name || 'Initial Consultation',
                duration: resolvedDuration,
                invoiceNumber: invoiceRef.current,
            });
            setIsLoading(false);
            setEmailSent(true);
            setStep(4);
        }, 1200);
    };

    const handleDownloadInvoice = () => {
        openPrintInvoice({
            invoiceNumber: invoiceRef.current,
            patientName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            clinicianName: clinician?.name || '',
            sessionName: selectedSession?.name || 'Appointment',
            duration: selectedSession?.durationLabel || '',
            price: selectedSession?.priceLabel || '',
            date: selectedDay ? getDayFormatted(selectedDay) : '',
            time: selectedSlot || '',
            clinicName: MOCK_CLINIC_DETAILS.name,
            clinicPhone: MOCK_CLINIC_DETAILS.phone,
            clinicEmail: MOCK_CLINIC_DETAILS.email,
            clinicAddress: MOCK_CLINIC_DETAILS.address,
            brandColor: color,
            logoDataUrl: branding.logo,
        });
    };

    if (!isOpen) return null;

    const steps = [
        { n: 1, label: 'Your Info', icon: User },
        { n: 2, label: 'Session', icon: Layers },
        { n: 3, label: 'Confirm', icon: CheckCircle },
    ];

    const inputBase = 'w-full h-11 px-3 text-sm border rounded-xl focus:outline-none transition-colors';
    const inputWithIcon = 'w-full h-11 pl-10 pr-3 text-sm border rounded-xl focus:outline-none transition-colors';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 pb-8" style={{ background: brandGradient(color) }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
                                {clinician?.name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{clinician?.name}</p>
                                <p className="text-white/70 text-xs">{clinician?.specialty}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <h2 className="text-xl font-black text-white">Book an Appointment</h2>
                    <p className="text-white/70 text-sm mt-1">Fill in your details to get started</p>
                </div>

                {/* Step indicators */}
                {step < 4 && (
                    <div className="bg-white border-b border-slate-100 px-6 py-4 -mt-2">
                        <div className="flex items-center justify-between">
                            {steps.map((s, i) => (
                                <div key={s.n} className="flex items-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                            style={step > s.n ? { backgroundColor: '#22c55e', color: '#fff' }
                                                : step === s.n ? { backgroundColor: color, color: '#fff' }
                                                    : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                                            {step > s.n ? <CheckCircle className="h-3.5 w-3.5" /> : s.n}
                                        </div>
                                        <span className="text-[11px] font-semibold hidden sm:block"
                                            style={{ color: step >= s.n ? (step > s.n ? '#22c55e' : color) : '#94a3b8' }}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="h-px w-4 sm:w-6 mx-1 sm:mx-2 transition-colors"
                                            style={{ backgroundColor: step > s.n ? '#86efac' : '#e2e8f0' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="p-6 max-h-[58vh] overflow-y-auto">

                    {/* Step 1 - Personal Info */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                            <p className="text-slate-500 text-sm">Your contact information so we can confirm your appointment.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name *</label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} placeholder="John"
                                            className={`${inputWithIcon} ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
                                    </div>
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name *</label>
                                    <input value={formData.lastName} onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe"
                                        className={`${inputBase} ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com"
                                        className={`${inputWithIcon} ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000"
                                        className={`${inputWithIcon} ${errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 2 - Session */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                            <p className="text-slate-500 text-sm mb-4">Choose a day and time slot that works for you.</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {availability.map((avail: any) => (
                                    <button key={avail.day} onClick={() => { setSelectedDay(avail.day); setSelectedSlot(avail?.slots?.[0] || null); setErrors({}); }}
                                        className="px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                                        style={selectedDay === avail.day
                                            ? { backgroundColor: color, color: '#fff', borderColor: color }
                                            : { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
                                        {avail.day}
                                    </button>
                                ))}
                            </div>
                            {!selectedDay && (
                                <div className="text-center py-8">
                                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" style={{ color }} />
                                    <p className="text-slate-400 text-sm">Select a day to continue</p>
                                </div>
                            )}
                            <p className="text-slate-500 text-sm mt-6 mb-4">Choose the type of session you'd like to book.</p>
                            {isSessionsLoading && (
                                <p className="text-xs text-slate-400 mb-3">Loading sessions...</p>
                            )}
                            <div className="space-y-3">
                                {sessionOptions.map(session => {
                                    const isSel = String(selectedSessionId) === String(session.id);
                                    return (
                                        <button key={session.id} onClick={() => { setSelectedSessionId(session.id); setErrors({}); }}
                                            className="w-full text-left rounded-2xl border-2 p-4 transition-all hover:shadow-md"
                                            style={isSel ? { borderColor: color, backgroundColor: brandBg(color, 0.06) } : { borderColor: '#e2e8f0', backgroundColor: '#fff' }}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                                        style={isSel ? { backgroundColor: brandBg(color, 0.15), color } : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
                                                        <Layers className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-900">{session.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.durationLabel}</span>
                                                            <span className="font-bold" style={isSel ? { color } : { color: '#64748b' }}>{session.priceLabel}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                                    style={isSel ? { borderColor: color, backgroundColor: color } : { borderColor: '#cbd5e1' }}>
                                                    {isSel && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.slot && <p className="text-red-500 text-xs mt-3">{errors.slot}</p>}
                            {errors.session && <p className="text-red-500 text-xs mt-3">{errors.session}</p>}
                        </div>
                    )}

                    {/* Step 3 - Confirm */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                            <p className="text-slate-500 text-sm mb-4">Review your booking before confirming.</p>
                            <div className="rounded-2xl border border-slate-100 overflow-hidden">
                                {[
                                    { label: 'Patient', value: `${formData.firstName} ${formData.lastName}` },
                                    { label: 'Email', value: formData.email },
                                    { label: 'Phone', value: formData.phone },
                                    { label: 'Clinician', value: clinician?.name },
                                    { label: 'Date', value: selectedDay ? getDayFormatted(selectedDay) : '-' },
                                    { label: 'Time', value: selectedSlot || '-' },
                                    { label: 'Session Type', value: selectedSession?.name || '-' },
                                    { label: 'Duration', value: selectedSession?.durationLabel || '-' },
                                    { label: 'Amount Due', value: selectedSession?.priceLabel || '-' },
                                ].map((item, i) => (
                                    <div key={item.label} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                                        <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%]">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4 - Success + Invoice */}
                    {step === 4 && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            {/* Success banner */}
                            <div className="text-center mb-5">
                                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900">Booking Confirmed!</h3>
                                <p className="text-slate-500 text-sm mt-1">{clinician?.name} · {selectedDay ? getDayFormatted(selectedDay) : ''} · {selectedSlot}</p>
                            </div>

                            {/* Email sent notice */}
                            {emailSent && (
                                <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 mb-4">
                                    <Send className="h-4 w-4 text-blue-500 shrink-0" />
                                    <p className="text-sm text-blue-700 font-medium">
                                        Invoice sent to <strong>{formData.email}</strong>
                                    </p>
                                </div>
                            )}

                            {/* Invoice preview card */}
                            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* Invoice header */}
                                <div className="p-4 flex items-center justify-between" style={{ background: brandGradient(color) }}>
                                    <div>
                                        <p className="text-white font-black text-sm">{MOCK_CLINIC_DETAILS.name}</p>
                                        <p className="text-white/70 text-xs mt-0.5">Invoice Preview</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/70 text-[10px] uppercase tracking-widest">Invoice</p>
                                        <p className="text-white font-black text-sm">{invoiceRef.current}</p>
                                        <p className="text-white/60 text-[10px]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                {/* Billed to */}
                                <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs">
                                    <div>
                                        <p className="text-slate-400 uppercase tracking-widest font-bold mb-1">Billed To</p>
                                        <p className="font-bold text-slate-800">{formData.firstName} {formData.lastName}</p>
                                        <p className="text-slate-500">{formData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 uppercase tracking-widest font-bold mb-1">From</p>
                                        <p className="font-bold text-slate-800">{MOCK_CLINIC_DETAILS.name}</p>
                                        <p className="text-slate-500">{MOCK_CLINIC_DETAILS.email}</p>
                                    </div>
                                </div>

                                {/* Line item */}
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">
                                        <span>Service</span><span>Amount</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{selectedSession?.name}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" /> {selectedSession?.durationLabel} · {clinician?.name}
                                            </p>
                                        </div>
                                        <p className="text-base font-black" style={{ color }}>{selectedSession?.priceLabel}</p>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <p className="text-xs text-slate-400 font-semibold">Total Due</p>
                                    <p className="text-lg font-black" style={{ color }}>{selectedSession?.priceLabel}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100">
                    {step === 4 ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownloadInvoice}
                                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 font-bold rounded-xl text-sm transition-all hover:opacity-80"
                                style={{ borderColor: color, color }}>
                                <Printer className="h-4 w-4" />
                                Download Invoice
                            </button>
                            <button onClick={onClose}
                                className="flex-1 py-3 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm"
                                style={{ background: brandGradient(color) }}>
                                Done
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button onClick={() => setStep(s => (s - 1) as Step)}
                                    className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                                    <ArrowLeft className="h-4 w-4" /> Back
                                </button>
                            )}
                            <button
                                onClick={step === 3 ? handleConfirm : handleNext}
                                disabled={isLoading}
                                className="flex-1 py-3 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                                style={{ background: brandGradient(color) }}>
                                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</>
                                    : step === 3 ? <><CheckCircle className="h-4 w-4" /> Confirm Booking</>
                                        : <>Next <ChevronRight className="h-4 w-4" /></>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
