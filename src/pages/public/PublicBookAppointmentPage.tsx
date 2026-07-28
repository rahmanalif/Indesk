import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Layers,
  Loader2,
  Mail,
  Printer,
  Send,
  User,
  Video,
} from "lucide-react";
import { fromZonedTime } from "date-fns-tz";
import { useData } from "../../context/DataContext";
import {
  useApplyAppointmentWithTokenMutation,
  useGetPublicAvailableSlotsQuery,
  useGetPublicClinicQuery,
  useGetSessionsByClinicianTokenQuery,
} from "../../redux/api/clientsApi";
import {
  brandBg,
  brandGradient,
  brandStrong,
  brandText,
  hexToHslToken,
  hexToRgb,
  readableTextOn,
} from "../../lib/branding";
import {
  PhoneNumberInput,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "../../components/ui/PhoneNumberInput";

export type BookAppointmentLocationState = {
  day?: string | null;
  sessionId?: string | number | null;
  time?: string | null;
};

type Step = 1 | 2 | 3 | 4;

const formatTime = (value?: string | null) => {
  if (!value || !value.includes(":")) return "-";
  const [hoursText, minutesText] = value.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

function generateInvoiceNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${rand}`;
}

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
  const { r, g, b } = hexToRgb(
    opts.brandColor.startsWith("#") ? opts.brandColor : "#0066FF"
  );
  const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;
  const gradient = `linear-gradient(135deg, ${opts.brandColor} 0%, ${darker} 100%)`;
  const dateLabel = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
      Print / Save as PDF
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
          <div class="total-line"><span>Tax (0%)</span><span>£0.00</span></div>
          <div class="total-line big"><span>Total Due</span><span>${opts.price}</span></div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for choosing <strong>${opts.clinicName}</strong>.<br/>
      Questions? Contact us at <a href="mailto:${opts.clinicEmail}">${opts.clinicEmail}</a> or <a href="tel:${opts.clinicPhone}">${opts.clinicPhone}</a></p>
    </div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=780,height=900");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

const normalizeAddress = (address: any) => {
  if (!address) return {};
  if (typeof address === "string") {
    try {
      return JSON.parse(address);
    } catch {
      return {};
    }
  }
  if (typeof address === "object") return address;
  return {};
};

export function PublicBookAppointmentPage() {
  const { linkId, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state || {}) as BookAppointmentLocationState;
  const { addPublicBooking, branding, sessionTypes: fallbackSessionTypes } =
    useData();

  const {
    data: clinicResponse,
    isLoading: isClinicLoading,
    isError: isClinicError,
  } = useGetPublicClinicQuery(linkId || "", {
    skip: !linkId,
    refetchOnMountOrArgChange: false,
  });
  const clinic = clinicResponse?.response?.data;

  const apiOrigin = useMemo(() => {
    try {
      return new URL(import.meta.env.VITE_API_BASE_URL).origin;
    } catch {
      return "";
    }
  }, []);

  const resolveImageUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith("http")) return value;
    if (!apiOrigin) return value;
    if (value.startsWith("/uploads/")) return `${apiOrigin}/public${value}`;
    return `${apiOrigin}${value}`;
  };

  const color = clinic?.color || branding.color || "#779362";
  const accent = brandStrong(color);
  const textColor = brandText(color);
  const onBrand = readableTextOn(color);
  const brandStyle = { "--primary": hexToHslToken(color) } as CSSProperties;
  const clinicName = clinic?.name || "Clinic";
  const clinicLogo = resolveImageUrl(clinic?.logo) || branding.logo;
  const clinicPhone =
    `${clinic?.countryCode || ""}${clinic?.phoneNumber || ""}`.trim() || "-";
  const clinicEmail = clinic?.email || "-";
  const addressObj = normalizeAddress(clinic?.address);
  const clinicAddress =
    [
      addressObj.street,
      addressObj.city,
      addressObj.state,
      addressObj.zip,
      addressObj.country,
    ]
      .map((part: string) => (part || "").trim())
      .filter(Boolean)
      .join(", ") || "-";

  const clinician = useMemo(() => {
    const members = clinic?.members || [];
    const member = members.find((m: any) => String(m.id) === String(id));
    if (!member) return null;
    const firstName = member?.user?.firstName || "";
    const lastName = member?.user?.lastName || "";
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") || "Clinician";
    const rawAvailabilitySchedule = Array.isArray(member?.availabilitySchedule)
      ? member.availabilitySchedule
      : [];
    const availabilityMap = new Map<string, any>();
    rawAvailabilitySchedule.forEach((item: any) => {
      const dayValue =
        typeof item?.day === "string" ? item.day.toLowerCase() : "";
      if (!dayValue || availabilityMap.has(dayValue)) return;
      availabilityMap.set(dayValue, item);
    });
    const specialization = Array.isArray(member?.specialization)
      ? member.specialization
      : [];

    return {
      id: member.id,
      clinicianToken: member?.clinicianToken || "",
      name: fullName,
      specialty:
        specialization.length > 0
          ? specialization.join(", ")
          : "",
      timezone: (member?.user as any)?.timezone || "Europe/London",
      availability: Array.from(availabilityMap.values()).map((item: any) => ({
        day: toTitleCase(item.day),
        startTime: item?.startTime || "",
        endTime: item?.endTime || "",
        breakTime: item?.breakTime || null,
      })),
    };
  }, [clinic?.members, id]);

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const invoiceRef = useRef<string>(generateInvoiceNumber());
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(
    prefill.day || null
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    prefill.time || null
  );
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | number | null
  >(prefill.sessionId ?? null);
  const [meetingType, setMeetingType] = useState<
    "in_person" | "zoom" | "google_meet"
  >("in_person");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prefillApplied = useRef(false);

  const availability = clinician?.availability || [];
  const clinicianToken = clinician?.clinicianToken || "";

  const { data: clinicianSessionsResponse, isLoading: isSessionsLoading } =
    useGetSessionsByClinicianTokenQuery(clinicianToken, {
      skip: !clinicianToken,
      refetchOnMountOrArgChange: false,
    });
  const [applyAppointment] = useApplyAppointmentWithTokenMutation();

  const parsedApiSessions = useMemo(() => {
    const raw = clinicianSessionsResponse?.response?.data as any;
    const rows = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.docs)
        ? raw.docs
        : [];
    return rows.map((session: any, index: number) => {
      const durationMinutes = Number(session?.duration) || 50;
      const priceNumber = Number(session?.price);
      return {
        id: session?.id || session?._id || `api-session-${index}`,
        name: session?.name || "Session",
        durationMinutes,
        durationLabel: `${durationMinutes} min`,
        priceLabel:
          Number.isFinite(priceNumber) && priceNumber >= 0
            ? `£${priceNumber}`
            : session?.price || "-",
      };
    });
  }, [clinicianSessionsResponse]);

  const parsedFallbackSessions = useMemo(() => {
    return fallbackSessionTypes.map((session) => {
      const durationMatch = String(session.duration || "").match(/\d+/);
      const durationMinutes = durationMatch ? Number(durationMatch[0]) : 50;
      return {
        id: session.id,
        name: session.name,
        durationMinutes,
        durationLabel: session.duration || `${durationMinutes} min`,
        priceLabel: session.price || "-",
      };
    });
  }, [fallbackSessionTypes]);

  const sessionOptions =
    parsedApiSessions.length > 0 ? parsedApiSessions : parsedFallbackSessions;
  const selectedSession = sessionOptions.find(
    (s: any) => String(s.id) === String(selectedSessionId)
  );

  const isZoomAvailable = Boolean((clinic as any)?.isZoomAvailable);
  const isMeetAvailable = Boolean((clinic as any)?.isMeetAvailable);

  const availableMeetingTypes = useMemo(() => {
    const types: Array<{
      id: "in_person" | "zoom" | "google_meet";
      label: string;
      icon: typeof User;
    }> = [{ id: "in_person", label: "In-Person", icon: User }];
    if (isZoomAvailable)
      types.push({ id: "zoom", label: "Zoom Video Call", icon: Video });
    if (isMeetAvailable)
      types.push({
        id: "google_meet",
        label: "Google Meet",
        icon: Video,
      });
    return types;
  }, [isZoomAvailable, isMeetAvailable]);

  useEffect(() => {
    if (isZoomAvailable) setMeetingType("zoom");
    else if (isMeetAvailable) setMeetingType("google_meet");
    else setMeetingType("in_person");
  }, [isZoomAvailable, isMeetAvailable]);

  useEffect(() => {
    if (prefillApplied.current) return;
    if (!prefill.day && !prefill.sessionId && !prefill.time) return;
    prefillApplied.current = true;
    if (prefill.day) setSelectedDay(prefill.day);
    if (prefill.sessionId != null) setSelectedSessionId(prefill.sessionId);
    if (prefill.time) setSelectedSlot(prefill.time);
    if (prefill.day || prefill.sessionId) setStep(2);
  }, [prefill.day, prefill.sessionId, prefill.time]);

  const getDayIsoDate = (dayName: string) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const targetDay = days.indexOf(dayName);
    let daysUntil = targetDay - today.getDay();
    if (daysUntil < 0) daysUntil += 7;
    if (daysUntil === 0) daysUntil = 7;
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + daysUntil
    );
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getDayFormatted = (dayName: string) => {
    const iso = getDayIsoDate(dayName);
    return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const { data: slotsResponse, isLoading: isSlotsLoading } =
    useGetPublicAvailableSlotsQuery(
      {
        clinicianToken,
        date: selectedDay ? getDayIsoDate(selectedDay) : "",
        sessionId: selectedSessionId ? String(selectedSessionId) : undefined,
      },
      {
        skip: !clinicianToken || !selectedDay,
        refetchOnMountOrArgChange: false,
      }
    );

  const availableSlots = useMemo(() => {
    return slotsResponse?.response?.data || [];
  }, [slotsResponse]);

  useEffect(() => {
    if (availableSlots && availableSlots.length > 0) {
      const matchedSlot = availableSlots.find(
        (s: any) => s.timeLabel === selectedSlot
      );
      if (matchedSlot) {
        setSelectedSlotIso(matchedSlot.startTime);
      } else {
        setSelectedSlot(availableSlots[0].timeLabel);
        setSelectedSlotIso(availableSlots[0].startTime);
      }
    } else if (!isSlotsLoading) {
      setSelectedSlot(null);
      setSelectedSlotIso(null);
    }
  }, [availableSlots, isSlotsLoading, selectedSlot]);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    const nameRegex = /^[\p{L}\s\-.,']+$/u;
    if (!formData.firstName.trim()) e.firstName = "First name is required.";
    else if (!nameRegex.test(formData.firstName.trim()))
      e.firstName = "Invalid characters in name.";
    if (!formData.lastName.trim()) e.lastName = "Last name is required.";
    else if (!nameRegex.test(formData.lastName.trim()))
      e.lastName = "Invalid characters in name.";
    if (!formData.email.match(/^[^@]+@[^@]+\.[^@]+$/))
      e.email = "Enter a valid email.";
    if (!formData.phone || !isValidPhoneNumber(formData.phone))
      e.phone = "Enter a valid phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!selectedDay) e.slot = "Please select a day.";
    if (!selectedSlot) e.slot = "Please select a time slot.";
    if (!selectedSessionId) e.session = "Please select a session type.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleConfirm = async () => {
    if (!clinician || !selectedDay || !selectedSessionId) return;
    setIsSubmitting(true);
    try {
      const clinicianTimezone = clinician.timezone || "Europe/London";
      const rawTime = selectedSlot || "09:00 AM";
      const [timePart, period] = rawTime.split(" ");
      const [h, m] = timePart.split(":");
      let hour = parseInt(h, 10);
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      const timeStr = `${String(hour).padStart(2, "0")}:${m || "00"}`;

      const dateStr = getDayIsoDate(selectedDay);
      const localDateTimeStr = `${dateStr} ${timeStr}:00`;
      const clinicianDateTime = fromZonedTime(localDateTimeStr, clinicianTimezone);
      const fullIsoDateTime = clinicianDateTime.toISOString();
      const timeToSend = selectedSlotIso || fullIsoDateTime;

      const parsedPhone = parsePhoneNumber(formData.phone || "");

      const response = await applyAppointment({
        token: clinicianToken,
        clientFirstName: formData.firstName,
        clientLastName: formData.lastName,
        clientEmail: formData.email,
        clientPhone: parsedPhone
          ? parsedPhone.nationalNumber
          : formData.phone,
        clientCountryCode: parsedPhone
          ? `+${parsedPhone.countryCallingCode}`
          : undefined,
        sessionId: String(selectedSessionId),
        time: timeToSend,
        meetingType,
      }).unwrap();

      const paymentUrl =
        (response as any).paymentUrl ||
        (response as any).response?.data?.paymentUrl ||
        (response as any).data?.paymentUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      const resolvedDuration = selectedSession?.durationMinutes || 50;
      addPublicBooking({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        clinicianName: clinician.name,
        date: getDayIsoDate(selectedDay),
        time: timeStr,
        sessionType: selectedSession?.name || "Initial Consultation",
        duration: resolvedDuration,
        invoiceNumber: invoiceRef.current,
      });
      setIsSubmitting(false);
      setEmailSent(true);
      setStep(4);
    } catch (err: any) {
      setErrors({
        submit: err?.data?.message || "Failed to book appointment",
      });
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoice = () => {
    openPrintInvoice({
      invoiceNumber: invoiceRef.current,
      patientName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      clinicianName: clinician?.name || "",
      sessionName: selectedSession?.name || "Appointment",
      duration: selectedSession?.durationLabel || "",
      price: selectedSession?.priceLabel || "",
      date: selectedDay ? getDayFormatted(selectedDay) : "",
      time: selectedSlot || "",
      clinicName,
      clinicPhone,
      clinicEmail,
      clinicAddress,
      brandColor: color,
      logoDataUrl: clinicLogo,
    });
  };

  if (isClinicLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-warm-gray">
        Loading booking...
      </div>
    );
  }

  if (isClinicError || !clinic || !clinician) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-warm-gray gap-4">
        <p>Unable to load booking details.</p>
        <button
          type="button"
          onClick={() => navigate(`/clinic-portal/${linkId}`)}
          className="text-sm font-medium underline"
          style={{ color: textColor }}
        >
          Back to clinic
        </button>
      </div>
    );
  }

  const steps = [
    { n: 1, label: "Your info" },
    { n: 2, label: "Session" },
    { n: 3, label: "Confirm" },
  ];

  const inputBase =
    "w-full h-11 px-3 text-sm border rounded-xl bg-warm-white focus:outline-none focus:ring-2 transition-colors";
  const inputWithIcon =
    "w-full h-11 pl-10 pr-3 text-sm border rounded-xl bg-warm-white focus:outline-none focus:ring-2 transition-colors";

  const selectedAvailability = availability.find(
    (avail: any) => avail.day === selectedDay
  );

  return (
    <div
      className="min-h-screen bg-cream text-charcoal font-sans"
      style={brandStyle}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#2D2A26 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-warm-gray/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt=""
                className="h-9 w-9 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center font-serif font-bold shrink-0"
                style={{ backgroundColor: accent, color: onBrand }}
              >
                {clinicName[0]}
              </div>
            )}
            <button
              type="button"
              onClick={() => navigate(`/clinic-portal/${linkId}`)}
              className="flex items-center gap-2 text-sm font-medium text-charcoal hover:opacity-70 transition-opacity truncate"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">Back to {clinicName}</span>
            </button>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-warm-gray hidden sm:block">
            Book appointment
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-28">
        <div className="mb-8">
          {clinician.specialty ? (
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: textColor }}
            >
              {clinician.specialty}
            </p>
          ) : null}
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
            Book with {clinician.name}
          </h1>
          <p className="text-warm-gray">
            A few details and we’ll confirm your session.
          </p>
        </div>

        {step < 4 && (
          <div className="flex items-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={
                      step > s.n
                        ? { backgroundColor: "#22c55e", color: "#fff" }
                        : step === s.n
                          ? { backgroundColor: accent, color: onBrand }
                          : {
                              backgroundColor: brandBg(color, 0.1),
                              color: "#8A8279",
                            }
                    }
                  >
                    {step > s.n ? <CheckCircle className="h-3.5 w-3.5" /> : s.n}
                  </div>
                  <span
                    className="text-xs font-semibold hidden sm:block truncate"
                    style={{
                      color:
                        step >= s.n
                          ? step > s.n
                            ? "#16a34a"
                            : textColor
                          : "#8A8279",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="h-px flex-1 min-w-[12px]"
                    style={{
                      backgroundColor: step > s.n ? "#86efac" : "#e5e7eb",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-warm-white/80 border border-warm-gray/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-warm-gray text-sm mb-2">
                Your contact information so we can confirm your appointment.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1.5">
                    First name *
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
                    <input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          firstName: e.target.value,
                        }))
                      }
                      placeholder="John"
                      className={`${inputWithIcon} ${
                        errors.firstName
                          ? "border-red-400 bg-red-50"
                          : "border-warm-gray/20"
                      }`}
                      style={
                        {
                          ["--tw-ring-color" as string]: brandBg(color, 0.35),
                        } as CSSProperties
                      }
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1.5">
                    Last name *
                  </label>
                  <input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, lastName: e.target.value }))
                    }
                    placeholder="Doe"
                    className={`${inputBase} ${
                      errors.lastName
                        ? "border-red-400 bg-red-50"
                        : "border-warm-gray/20"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="john@example.com"
                    className={`${inputWithIcon} ${
                      errors.email
                        ? "border-red-400 bg-red-50"
                        : "border-warm-gray/20"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Phone *
                </label>
                <PhoneNumberInput
                  value={formData.phone}
                  onChange={(val) =>
                    setFormData((f) => ({ ...f, phone: val }))
                  }
                  error={errors.phone}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in duration-200">
              <p className="text-warm-gray text-sm mb-4">
                Choose a day, time, and session type.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {availability.map((avail: any) => (
                  <button
                    key={avail.day}
                    type="button"
                    onClick={() => {
                      setSelectedDay(avail.day);
                      setSelectedSlot(null);
                      setErrors({});
                    }}
                    className="px-3 py-2 rounded-full text-xs font-bold border transition-all"
                    style={
                      selectedDay === avail.day
                        ? {
                            backgroundColor: color,
                            color: onBrand,
                            borderColor: color,
                          }
                        : {
                            backgroundColor: "#fff",
                            color: "#8A8279",
                            borderColor: "#e5e7eb",
                          }
                    }
                  >
                    {avail.day}
                  </button>
                ))}
              </div>

              {selectedDay && selectedAvailability && (
                <div
                  className="mb-4 rounded-2xl border px-4 py-3 text-sm text-warm-gray"
                  style={{
                    borderColor: brandBg(color, 0.18),
                    backgroundColor: brandBg(color, 0.05),
                  }}
                >
                  <p>
                    <strong className="text-charcoal">Working hours:</strong>{" "}
                    {formatTime(selectedAvailability.startTime)} –{" "}
                    {formatTime(selectedAvailability.endTime)}
                  </p>
                  {selectedAvailability.breakTime?.startTime &&
                    selectedAvailability.breakTime?.endTime && (
                      <p className="mt-1">
                        <strong className="text-charcoal">Break:</strong>{" "}
                        {formatTime(selectedAvailability.breakTime.startTime)} –{" "}
                        {formatTime(selectedAvailability.breakTime.endTime)}
                      </p>
                    )}
                </div>
              )}

              {selectedDay ? (
                <div className="mb-6">
                  <p className="text-charcoal font-bold text-xs mb-3 uppercase tracking-wider">
                    Available time slots
                  </p>
                  {isSlotsLoading ? (
                    <div className="flex items-center gap-2 text-xs text-warm-gray py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading available slots...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {availableSlots.map((slot: any) => {
                        const isSelected = selectedSlot === slot.timeLabel;
                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot.timeLabel);
                              setSelectedSlotIso(slot.startTime);
                              setErrors({});
                            }}
                            className="px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center"
                            style={
                              isSelected
                                ? {
                                    backgroundColor: accent,
                                    color: onBrand,
                                    borderColor: color,
                                  }
                                : {
                                    backgroundColor: "#fff",
                                    color: "#475569",
                                    borderColor: "#e5e7eb",
                                  }
                            }
                          >
                            {slot.timeLabel}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-red-500 font-medium">
                      No available slots on this day. Please try another day.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar
                    className="h-10 w-10 mx-auto mb-2 opacity-30"
                    style={{ color }}
                  />
                  <p className="text-warm-gray text-sm">
                    Select a day to continue
                  </p>
                </div>
              )}

              <p className="text-warm-gray text-sm mt-2 mb-4">
                Session type
              </p>
              {isSessionsLoading && (
                <p className="text-xs text-warm-gray mb-3">Loading sessions...</p>
              )}
              <div className="space-y-3">
                {sessionOptions.map((session: any) => {
                  const isSel =
                    String(selectedSessionId) === String(session.id);
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => {
                        setSelectedSessionId(session.id);
                        setErrors({});
                      }}
                      className="w-full text-left rounded-2xl border-2 p-4 transition-all hover:shadow-sm"
                      style={
                        isSel
                          ? {
                              borderColor: color,
                              backgroundColor: brandBg(color, 0.06),
                            }
                          : {
                              borderColor: "#e5e7eb",
                              backgroundColor: "#fff",
                            }
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                            style={
                              isSel
                                ? {
                                    backgroundColor: brandBg(color, 0.15),
                                    color,
                                  }
                                : {
                                    backgroundColor: "#f1f5f9",
                                    color: "#64748b",
                                  }
                            }
                          >
                            <Layers className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-charcoal">
                              {session.name}
                            </p>
                            <p className="text-xs text-warm-gray mt-0.5 flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.durationLabel}
                              </span>
                              <span
                                className="font-bold"
                                style={
                                  isSel ? { color } : { color: "#64748b" }
                                }
                              >
                                {session.priceLabel}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div
                          className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={
                            isSel
                              ? { borderColor: accent, backgroundColor: accent }
                              : { borderColor: "#cbd5e1" }
                          }
                        >
                          {isSel && (
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {availableMeetingTypes.length > 1 && (
                <div className="mt-6">
                  <p className="text-warm-gray text-sm mb-3">
                    Preferred meeting type
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {availableMeetingTypes.map((type) => {
                      const isSelected = meetingType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setMeetingType(type.id)}
                          className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all"
                          style={
                            isSelected
                              ? {
                                  borderColor: color,
                                  backgroundColor: brandBg(color, 0.05),
                                }
                              : {
                                  borderColor: "#e5e7eb",
                                  backgroundColor: "#fff",
                                }
                          }
                        >
                          <type.icon
                            className="h-6 w-6 mb-2"
                            style={{
                              color: isSelected ? color : "#64748b",
                            }}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{
                              color: isSelected ? color : "#475569",
                            }}
                          >
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {errors.slot && (
                <p className="text-red-500 text-xs mt-3">{errors.slot}</p>
              )}
              {errors.session && (
                <p className="text-red-500 text-xs mt-3">{errors.session}</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in duration-200">
              <p className="text-warm-gray text-sm mb-4">
                Review your booking before confirming.
              </p>
              <div className="rounded-2xl border border-warm-gray/15 overflow-hidden">
                {[
                  {
                    label: "Patient",
                    value: `${formData.firstName} ${formData.lastName}`,
                  },
                  { label: "Email", value: formData.email },
                  { label: "Phone", value: formData.phone },
                  { label: "Clinician", value: clinician.name },
                  {
                    label: "Date",
                    value: selectedDay ? getDayFormatted(selectedDay) : "-",
                  },
                  { label: "Time", value: selectedSlot || "-" },
                  {
                    label: "Meeting type",
                    value:
                      availableMeetingTypes.find((t) => t.id === meetingType)
                        ?.label || "-",
                  },
                  {
                    label: "Session type",
                    value: selectedSession?.name || "-",
                  },
                  {
                    label: "Duration",
                    value: selectedSession?.durationLabel || "-",
                  },
                  {
                    label: "Amount due",
                    value: selectedSession?.priceLabel || "-",
                  },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i % 2 === 0 ? "bg-cream/80" : "bg-warm-white"
                    }`}
                  >
                    <span className="text-xs font-bold text-warm-gray uppercase tracking-widest">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-charcoal text-right max-w-[60%]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              {errors.submit && (
                <p className="text-red-500 text-sm font-semibold mt-4 text-center">
                  {errors.submit}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-5">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-serif text-charcoal">
                  Booking confirmed
                </h3>
                <p className="text-warm-gray text-sm mt-1">
                  {clinician.name} ·{" "}
                  {selectedDay ? getDayFormatted(selectedDay) : ""} ·{" "}
                  {selectedSlot}
                </p>
              </div>

              {emailSent && (
                <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 mb-4">
                  <Send className="h-4 w-4 text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-700 font-medium">
                    Invoice sent to <strong>{formData.email}</strong>
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-warm-gray/15 overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ background: brandGradient(color) }}
                >
                  <div>
                    <p className="text-white font-bold text-sm">{clinicName}</p>
                    <p className="text-white/70 text-xs mt-0.5">
                      Invoice preview
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-[10px] uppercase tracking-widest">
                      Invoice
                    </p>
                    <p className="text-white font-black text-sm">
                      {invoiceRef.current}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 border-b border-warm-gray/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-charcoal">
                        {selectedSession?.name}
                      </p>
                      <p className="text-xs text-warm-gray mt-0.5">
                        {selectedSession?.durationLabel} · {clinician.name}
                      </p>
                    </div>
                    <p className="text-base font-black" style={{ color }}>
                      {selectedSession?.priceLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-warm-gray/10 bg-cream/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          {step === 4 ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 font-bold rounded-full text-sm transition-all hover:opacity-80"
                style={{ borderColor: color, color }}
              >
                <Printer className="h-4 w-4" />
                Download invoice
              </button>
              <button
                type="button"
                onClick={() => navigate(`/clinic-portal/${linkId}`)}
                className="flex-1 py-3 font-bold rounded-full text-sm"
                style={{ backgroundColor: accent, color: onBrand }}
              >
                Done
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="flex items-center gap-2 px-5 py-3 border border-warm-gray/20 text-charcoal font-semibold rounded-full hover:bg-warm-white transition-colors text-sm"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
              <button
                type="button"
                onClick={step === 3 ? handleConfirm : handleNext}
                disabled={isSubmitting}
                className="flex-1 py-3 font-bold rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                style={{ backgroundColor: accent, color: onBrand }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirming...
                  </>
                ) : step === 3 ? (
                  <>
                    <CheckCircle className="h-4 w-4" /> Confirm booking
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
