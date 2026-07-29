import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar as CalendarIcon,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Printer,
  Send,
  User,
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

type BookingStep =
  | "session"
  | "meeting"
  | "day"
  | "time"
  | "details"
  | "confirm"
  | "success";

type MeetingTypeId = "in_person" | "zoom" | "google_meet";

const BOOKING_WINDOW_DAYS = 15;

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function ZoomBrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="48" height="48" rx="12" fill="#2D8CFF" />
      <path
        fill="#FFFFFF"
        d="M14.5 17.25c0-1.24 1-2.25 2.25-2.25h11.5c1.24 0 2.25 1.01 2.25 2.25v13.5c0 1.24-1.01 2.25-2.25 2.25h-11.5c-1.24 0-2.25-1.01-2.25-2.25v-13.5zm19.1 1.35 4.65-2.7c.74-.43 1.65.12 1.65.98v14.24c0 .86-.91 1.41-1.65.98l-4.65-2.7V18.6z"
      />
    </svg>
  );
}

function GoogleMeetBrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        fill="#00832D"
        d="M24 25.5V36H8.5C6.6 36 5 34.4 5 32.5v-15C5 15.6 6.6 14 8.5 14H18l6 11.5z"
      />
      <path
        fill="#0066DA"
        d="M24 14h14.5c1.9 0 3.5 1.6 3.5 3.5V22L33 25.5 24 14z"
      />
      <path
        fill="#E37400"
        d="M24 36 33 25.5 42 29v3.5c0 1.9-1.6 3.5-3.5 3.5H24z"
      />
      <path fill="#2684FC" d="M42 22v7l-9-3.5L42 22z" />
      <path fill="#00AC47" d="M24 25.5 18 14h-1.5L24 25.5z" />
      <path fill="#00832D" d="M8.5 14C6.6 14 5 15.6 5 17.5V22h13L8.5 14z" />
      <path
        fill="#FFBA00"
        d="M36.6 16.1c.9-.9 2.1-1.4 3.4-1.5-.2-1.1-.7-2-1.5-2.7C36.9 10.4 34.7 10.4 33.1 12l-5.5 5.5L33 25.5l3.6-9.4z"
      />
      <path
        fill="#0066DA"
        d="M42 22v10.5c0 .8-.2 1.5-.7 2.1L33 25.5 42 22z"
      />
    </svg>
  );
}

const STEP_ORDER: Array<Exclude<BookingStep, "success">> = [
  "session",
  "meeting",
  "day",
  "time",
  "details",
  "confirm",
];

const STEP_LABELS: Record<Exclude<BookingStep, "success">, string> = {
  session: "Service",
  meeting: "Format",
  day: "Date",
  time: "Time",
  details: "Details",
  confirm: "Confirm",
};

const toIsoDateLocal = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatIsoLong = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const formatIsoShort = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

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
        specialization.length > 0 ? specialization.join(", ") : "",
      timezone: (member?.user as any)?.timezone || "Europe/London",
      availability: Array.from(availabilityMap.values()).map((item: any) => ({
        day: toTitleCase(item.day),
        startTime: item?.startTime || "",
        endTime: item?.endTime || "",
        breakTime: item?.breakTime || null,
      })),
    };
  }, [clinic?.members, id]);

  const [step, setStep] = useState<BookingStep>("session");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const invoiceRef = useRef<string>(generateInvoiceNumber());
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    prefill.time || null
  );
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | number | null
  >(prefill.sessionId ?? null);
  const [meetingType, setMeetingType] = useState<MeetingTypeId>("in_person");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prefillApplied = useRef(false);

  const availability = clinician?.availability || [];
  const clinicianToken = clinician?.clinicianToken || "";

  const availableWeekdays = useMemo(() => {
    return new Set(
      availability.map((item: any) => String(item.day || "").toLowerCase())
    );
  }, [availability]);

  const bookableDates = useMemo(() => {
    if (availableWeekdays.size === 0) return [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const dates: Array<{
      iso: string;
      weekday: string;
      dayNumber: number;
      monthLabel: string;
      isToday: boolean;
    }> = [];

    for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const weekday = WEEKDAY_NAMES[date.getDay()];
      if (!availableWeekdays.has(weekday.toLowerCase())) continue;
      dates.push({
        iso: toIsoDateLocal(date),
        weekday,
        dayNumber: date.getDate(),
        monthLabel: date.toLocaleDateString("en-GB", { month: "short" }),
        isToday: offset === 0,
      });
    }
    return dates;
  }, [availableWeekdays]);

  const bookableDateSet = useMemo(
    () => new Set(bookableDates.map((d) => d.iso)),
    [bookableDates]
  );

  const bookingWindowBounds = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const end = new Date(today);
    end.setDate(today.getDate() + BOOKING_WINDOW_DAYS - 1);
    return {
      startMonth: new Date(today.getFullYear(), today.getMonth(), 1),
      endMonth: new Date(end.getFullYear(), end.getMonth(), 1),
      todayIso: toIsoDateLocal(today),
    };
  }, []);

  const canGoPrevMonth =
    calendarMonth.getFullYear() > bookingWindowBounds.startMonth.getFullYear() ||
    (calendarMonth.getFullYear() === bookingWindowBounds.startMonth.getFullYear() &&
      calendarMonth.getMonth() > bookingWindowBounds.startMonth.getMonth());

  const canGoNextMonth =
    calendarMonth.getFullYear() < bookingWindowBounds.endMonth.getFullYear() ||
    (calendarMonth.getFullYear() === bookingWindowBounds.endMonth.getFullYear() &&
      calendarMonth.getMonth() < bookingWindowBounds.endMonth.getMonth());

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    // Monday-first index: Sun=6, Mon=0, ...
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{
      key: string;
      iso: string | null;
      dayNumber: number | null;
      isBookable: boolean;
      isToday: boolean;
      isSelected: boolean;
      inMonth: boolean;
    }> = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push({
        key: `pad-${i}`,
        iso: null,
        dayNumber: null,
        isBookable: false,
        isToday: false,
        isSelected: false,
        inMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const iso = toIsoDateLocal(date);
      const isBookable = bookableDateSet.has(iso);
      cells.push({
        key: iso,
        iso,
        dayNumber: day,
        isBookable,
        isToday: iso === bookingWindowBounds.todayIso,
        isSelected: selectedDate === iso,
        inMonth: true,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        key: `trail-${cells.length}`,
        iso: null,
        dayNumber: null,
        isBookable: false,
        isToday: false,
        isSelected: false,
        inMonth: false,
      });
    }

    return cells;
  }, [
    calendarMonth,
    bookableDateSet,
    bookingWindowBounds.todayIso,
    selectedDate,
  ]);

  const resolvePrefillDate = (raw?: string | null) => {
    if (!raw) return null;
    if (isIsoDate(raw)) return raw;
    const match = bookableDates.find(
      (d) => d.weekday.toLowerCase() === raw.toLowerCase()
    );
    return match?.iso || null;
  };

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
        durationLabel: `${durationMinutes} minutes`,
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
        durationLabel: session.duration || `${durationMinutes} minutes`,
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
      id: MeetingTypeId;
      label: string;
      hint: string;
      icon: ReactNode;
    }> = [
      {
        id: "in_person",
        label: "In person",
        hint: "Visit the clinic",
        icon: null,
      },
    ];
    if (isZoomAvailable)
      types.push({
        id: "zoom",
        label: "Zoom",
        hint: "Video call link by email",
        icon: <ZoomBrandIcon className="h-8 w-8 rounded-[9px] shadow-sm" />,
      });
    if (isMeetAvailable)
      types.push({
        id: "google_meet",
        label: "Google Meet",
        hint: "Video call link by email",
        icon: <GoogleMeetBrandIcon className="h-8 w-8" />,
      });
    return types;
  }, [isZoomAvailable, isMeetAvailable]);

  const showMeetingStep = availableMeetingTypes.length > 1;

  const visibleSteps = useMemo(
    () => STEP_ORDER.filter((s) => s !== "meeting" || showMeetingStep),
    [showMeetingStep]
  );

  const goToNext = (from: Exclude<BookingStep, "success">) => {
    const idx = visibleSteps.indexOf(from);
    if (idx >= 0 && idx < visibleSteps.length - 1) {
      setStep(visibleSteps[idx + 1]);
      setErrors({});
    }
  };

  const goToPrev = () => {
    const idx = visibleSteps.indexOf(step as Exclude<BookingStep, "success">);
    if (idx > 0) {
      setStep(visibleSteps[idx - 1]);
      setErrors({});
    }
  };

  useEffect(() => {
    if (isZoomAvailable) setMeetingType("zoom");
    else if (isMeetAvailable) setMeetingType("google_meet");
    else setMeetingType("in_person");
  }, [isZoomAvailable, isMeetAvailable]);

  useEffect(() => {
    if (prefillApplied.current) return;
    if (!prefill.day && !prefill.sessionId && !prefill.time) return;
    // Wait until bookable dates are known when a day was prefilled
    if (prefill.day && bookableDates.length === 0 && availability.length > 0) {
      return;
    }
    prefillApplied.current = true;
    const resolvedDate = resolvePrefillDate(prefill.day);
    if (resolvedDate) {
      setSelectedDate(resolvedDate);
      const [y, m] = resolvedDate.split("-").map(Number);
      setCalendarMonth(new Date(y, m - 1, 1));
    }
    if (prefill.sessionId != null) setSelectedSessionId(prefill.sessionId);
    if (prefill.time) setSelectedSlot(prefill.time);

    if (resolvedDate && prefill.time && prefill.sessionId != null) {
      setStep("details");
    } else if (resolvedDate && prefill.sessionId != null) {
      setStep("time");
    } else if (prefill.sessionId != null) {
      setStep(showMeetingStep ? "meeting" : "day");
    } else if (resolvedDate) {
      setStep("session");
    }
  }, [
    prefill.day,
    prefill.sessionId,
    prefill.time,
    showMeetingStep,
    bookableDates,
    availability.length,
  ]);

  const contentRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [step]);

  const { data: slotsResponse, isLoading: isSlotsLoading } =
    useGetPublicAvailableSlotsQuery(
      {
        clinicianToken,
        date: selectedDate || "",
        sessionId: selectedSessionId ? String(selectedSessionId) : undefined,
      },
      {
        skip: !clinicianToken || !selectedDate,
        refetchOnMountOrArgChange: false,
      }
    );

  const availableSlots = useMemo(() => {
    return slotsResponse?.response?.data || [];
  }, [slotsResponse]);

  useEffect(() => {
    if (optionsRef.current && optionsRef.current.children.length > 0) {
      gsap.fromTo(
        optionsRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.28, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [step, sessionOptions, availableSlots, bookableDates, availableMeetingTypes]);

  useEffect(() => {
    if (!selectedDate) return;
    if (availableSlots && availableSlots.length > 0) {
      const matchedSlot = availableSlots.find(
        (s: any) => s.timeLabel === selectedSlot
      );
      if (matchedSlot) {
        setSelectedSlotIso(matchedSlot.startTime);
      } else if (step === "time") {
        setSelectedSlot(null);
        setSelectedSlotIso(null);
      }
    } else if (!isSlotsLoading && step === "time") {
      setSelectedSlot(null);
      setSelectedSlotIso(null);
    }
  }, [availableSlots, isSlotsLoading, selectedSlot, step, selectedDate]);

  const validateDetails = () => {
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

  const handleNext = () => {
    if (step === "session") {
      if (!selectedSessionId) {
        setErrors({ session: "Please select a session." });
        return;
      }
      goToNext("session");
      return;
    }
    if (step === "meeting") {
      goToNext("meeting");
      return;
    }
    if (step === "day") {
      if (!selectedDate) {
        setErrors({ day: "Please select a date." });
        return;
      }
      goToNext("day");
      return;
    }
    if (step === "time") {
      if (!selectedSlot) {
        setErrors({ time: "Please select a time." });
        return;
      }
      goToNext("time");
      return;
    }
    if (step === "details" && validateDetails()) {
      goToNext("details");
    }
  };

  const handleConfirm = async () => {
    if (!clinician || !selectedDate || !selectedSessionId) return;
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

      const dateStr = selectedDate;
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
        date: selectedDate,
        time: timeStr,
        sessionType: selectedSession?.name || "Initial Consultation",
        duration: resolvedDuration,
        invoiceNumber: invoiceRef.current,
      });
      setIsSubmitting(false);
      setEmailSent(true);
      setStep("success");
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
      date: selectedDate ? formatIsoLong(selectedDate) : "",
      time: selectedSlot || "",
      clinicName,
      clinicPhone,
      clinicEmail,
      clinicAddress,
      brandColor: color,
      logoDataUrl: clinicLogo,
    });
  };

  const meetingLabel =
    availableMeetingTypes.find((t) => t.id === meetingType)?.label || "-";

  const stepHeadline: Record<BookingStep, string> = {
    session: "What would you like to book?",
    meeting: "How would you like to meet?",
    day: "Which date works for you?",
    time: "What time suits you?",
    details: "Your contact details",
    confirm: "Please check your booking",
    success: "You're all set",
  };

  const stepSubhead: Record<BookingStep, string> = {
    session: "Choose the session that suits you best.",
    meeting: "In person at the clinic, or by video call.",
    day: `Showing the next ${BOOKING_WINDOW_DAYS} days with availability.`,
    time: selectedDate
      ? `Open times on ${formatIsoLong(selectedDate)}.`
      : "Select a time that works for you.",
    details: "We’ll use these details to confirm your appointment.",
    confirm: "Take a moment to review, then confirm.",
    success: "Your appointment is confirmed.",
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

  const inputBase =
    "w-full h-14 px-4 text-base border rounded-2xl bg-warm-white focus:outline-none focus:ring-2 transition-colors";
  const inputWithIcon =
    "w-full h-14 pl-11 pr-4 text-base border rounded-2xl bg-warm-white focus:outline-none focus:ring-2 transition-colors";

  const currentStepIndex =
    step === "success"
      ? visibleSteps.length
      : Math.max(0, visibleSteps.indexOf(step));

  const summaryChips = [
    selectedSession
      ? { key: "session", label: selectedSession.name }
      : null,
    showMeetingStep && selectedSession
      ? { key: "meeting", label: meetingLabel }
      : null,
    selectedDate ? { key: "day", label: formatIsoShort(selectedDate) } : null,
    selectedSlot ? { key: "time", label: selectedSlot } : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  const canContinue =
    (step === "session" && Boolean(selectedSessionId)) ||
    step === "meeting" ||
    (step === "day" && Boolean(selectedDate)) ||
    (step === "time" && Boolean(selectedSlot)) ||
    step === "details" ||
    step === "confirm";

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt=""
                className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-warm-gray/10"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 ring-1 ring-warm-gray/10"
                style={{
                  background: `linear-gradient(145deg, ${brandBg(color, 0.22)} 0%, ${brandBg(color, 0.08)} 100%)`,
                  color: textColor,
                }}
                aria-hidden
              >
                <Building2 className="h-5 w-5" strokeWidth={1.75} />
              </div>
            )}
            <button
              type="button"
              onClick={() => navigate(`/clinic-portal/${linkId}`)}
              className="flex items-center gap-2 text-sm font-medium text-charcoal hover:opacity-70 transition-opacity truncate"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">{clinicName}</span>
            </button>
          </div>
          {step !== "success" && (
            <p className="text-sm font-semibold text-warm-gray tabular-nums">
              Step {currentStepIndex + 1} of {visibleSteps.length}
            </p>
          )}
        </div>
      </header>

      <main
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
        style={{
          paddingBottom:
            "max(11rem, calc(8.5rem + env(safe-area-inset-bottom, 0px)))",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">
          {/* Sticky context panel — Calendly-style */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
            <div>
              {clinician.specialty ? (
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: textColor }}
                >
                  {clinician.specialty}
                </p>
              ) : null}
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal leading-tight">
                {clinician.name}
              </h1>
              <p className="text-base text-warm-gray mt-3 leading-relaxed">
                Book your appointment in a few simple steps.
              </p>
            </div>

            {summaryChips.length > 0 && step !== "success" && (
              <div
                className="rounded-2xl border p-4 space-y-3"
                style={{
                  borderColor: brandBg(color, 0.2),
                  backgroundColor: brandBg(color, 0.04),
                }}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
                  Your selection
                </p>
                <ul className="space-y-3">
                  {summaryChips.map((chip) => (
                    <li
                      key={chip.key}
                      className="flex items-start gap-3 text-base text-charcoal"
                    >
                      <span
                        className="mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: brandBg(color, 0.18), color }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="font-medium leading-snug">
                        {chip.label}
                      </span>
                    </li>
                  ))}
                </ul>
                {selectedSession?.priceLabel && (
                  <div className="pt-3 border-t border-warm-gray/10 flex items-center justify-between">
                    <span className="text-sm text-warm-gray">Price</span>
                    <span className="text-base font-semibold" style={{ color }}>
                      {selectedSession.priceLabel}
                      {selectedSession.durationLabel
                        ? ` · ${selectedSession.durationLabel}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            )}

            {step !== "success" && (
              <div className="hidden lg:flex flex-col gap-1.5">
                {visibleSteps.map((s, i) => {
                  const done = currentStepIndex > i;
                  const active = step === s;
                  return (
                    <div
                      key={s}
                      className="flex items-center gap-3 py-1"
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={
                          done
                            ? { backgroundColor: "#779362", color: "#fff" }
                            : active
                              ? { backgroundColor: accent, color: onBrand }
                              : {
                                  backgroundColor: brandBg(color, 0.1),
                                  color: "#6b635c",
                                }
                        }
                      >
                        {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: done
                            ? "#5F7A4E"
                            : active
                              ? textColor
                              : "#6b635c",
                        }}
                      >
                        {STEP_LABELS[s]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Focused step content */}
          <div>
            {step !== "success" && (
              <div className="mb-6 lg:mb-8">
                <div className="flex gap-1.5 mb-5 lg:hidden">
                  {visibleSteps.map((s, i) => (
                    <div
                      key={s}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          currentStepIndex >= i ? accent : brandBg(color, 0.12),
                      }}
                    />
                  ))}
                </div>
                <h2 className="font-serif text-3xl sm:text-[2rem] text-charcoal leading-snug">
                  {stepHeadline[step]}
                </h2>
                <p className="text-base text-warm-gray mt-3 leading-relaxed">
                  {stepSubhead[step]}
                </p>
              </div>
            )}

            <div
              ref={contentRef}
              className={
                step === "session"
                  ? "min-h-[280px]"
                  : "bg-warm-white/90 border border-warm-gray/10 rounded-[1.75rem] p-5 sm:p-7 shadow-sm min-h-[280px]"
              }
            >
              {step === "session" && (
                <div>
                  {isSessionsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-warm-gray py-10 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading sessions...
                    </div>
                  ) : (
                    <div ref={optionsRef} className="space-y-3">
                      {sessionOptions.map((session: any) => {
                        const isSel =
                          String(selectedSessionId) === String(session.id);
                        return (
                          <button
                            key={session.id}
                            type="button"
                            onClick={() => {
                              setSelectedSessionId(session.id);
                              setSelectedSlot(null);
                              setSelectedSlotIso(null);
                              setErrors({});
                            }}
                            className="w-full rounded-2xl border bg-white px-5 py-6 text-left transition-all duration-200 hover:border-warm-gray/30 hover:shadow-sm sm:px-6"
                            style={
                              isSel
                                ? {
                                    borderColor: color,
                                    backgroundColor: brandBg(color, 0.05),
                                    boxShadow: `0 0 0 1px ${color}`,
                                  }
                                : {
                                    borderColor: "rgba(138,130,121,0.14)",
                                  }
                            }
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-serif text-2xl text-charcoal tracking-tight">
                                  {session.name}
                                </p>
                                <p className="mt-2 inline-flex items-center gap-2 text-base text-warm-gray">
                                  <Clock className="h-4 w-4" />
                                  {session.durationLabel}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-3">
                                <p
                                  className="text-xl font-semibold tabular-nums"
                                  style={{ color: isSel ? color : textColor }}
                                >
                                  {session.priceLabel}
                                </p>
                                <span
                                  className="flex h-10 w-10 items-center justify-center rounded-full"
                                  style={
                                    isSel
                                      ? {
                                          backgroundColor: accent,
                                          color: onBrand,
                                        }
                                      : {
                                          backgroundColor: "#f3f0eb",
                                          color: "#6b635c",
                                        }
                                  }
                                >
                                  {isSel ? (
                                    <Check className="h-4 w-4" strokeWidth={3} />
                                  ) : (
                                    <ChevronRight className="h-5 w-5" />
                                  )}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.session && (
                    <p className="text-red-500 text-xs mt-3">{errors.session}</p>
                  )}
                </div>
              )}

              {step === "meeting" && (
                <div ref={optionsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableMeetingTypes.map((type) => {
                    const isSelected = meetingType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setMeetingType(type.id);
                          setErrors({});
                        }}
                        className="flex flex-col items-start text-left p-6 rounded-2xl border-2 transition-all hover:shadow-sm min-h-[140px]"
                        style={
                          isSelected
                            ? {
                                borderColor: color,
                                backgroundColor: brandBg(color, 0.06),
                              }
                            : {
                                borderColor: "#e8e4de",
                                backgroundColor: "#fff",
                              }
                        }
                      >
                        {type.id === "in_person" ? (
                          <MapPin
                            className="h-8 w-8 mb-4"
                            style={{ color: isSelected ? color : "#6b635c" }}
                          />
                        ) : (
                          <div className="mb-4">{type.icon}</div>
                        )}
                        <span
                          className="text-lg font-semibold"
                          style={{ color: isSelected ? color : "#2D2A26" }}
                        >
                          {type.label}
                        </span>
                        <span className="text-base text-warm-gray mt-2 leading-snug">
                          {type.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === "day" && (
                <div>
                  {bookableDates.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon
                        className="h-12 w-12 mx-auto mb-4 opacity-30"
                        style={{ color }}
                      />
                      <p className="text-base text-warm-gray">
                        No available dates right now. Please check back later.
                      </p>
                    </div>
                  ) : (
                    <div
                      ref={optionsRef}
                      className="rounded-[1.75rem] border border-warm-gray/15 bg-white p-4 sm:p-6"
                    >
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <button
                          type="button"
                          aria-label="Previous month"
                          disabled={!canGoPrevMonth}
                          onClick={() =>
                            setCalendarMonth(
                              (current) =>
                                new Date(
                                  current.getFullYear(),
                                  current.getMonth() - 1,
                                  1
                                )
                            )
                          }
                          className="h-11 w-11 rounded-full border border-warm-gray/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cream transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <p className="font-serif text-xl sm:text-2xl text-charcoal text-center">
                          {calendarMonth.toLocaleDateString("en-GB", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <button
                          type="button"
                          aria-label="Next month"
                          disabled={!canGoNextMonth}
                          onClick={() =>
                            setCalendarMonth(
                              (current) =>
                                new Date(
                                  current.getFullYear(),
                                  current.getMonth() + 1,
                                  1
                                )
                            )
                          }
                          className="h-11 w-11 rounded-full border border-warm-gray/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cream transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (label) => (
                            <div
                              key={label}
                              className="h-10 flex items-center justify-center text-sm font-semibold text-warm-gray"
                            >
                              {label}
                            </div>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {calendarCells.map((cell) => {
                          if (!cell.inMonth || cell.dayNumber == null) {
                            return (
                              <div
                                key={cell.key}
                                className="aspect-square min-h-[48px] sm:min-h-[56px]"
                              />
                            );
                          }

                          if (!cell.isBookable) {
                            return (
                              <div
                                key={cell.key}
                                className="aspect-square min-h-[48px] sm:min-h-[56px] rounded-2xl flex items-center justify-center text-base tabular-nums text-warm-gray/35"
                                aria-hidden
                              >
                                {cell.dayNumber}
                              </div>
                            );
                          }

                          return (
                            <button
                              key={cell.key}
                              type="button"
                              aria-label={
                                cell.iso
                                  ? formatIsoLong(cell.iso)
                                  : `Day ${cell.dayNumber}`
                              }
                              aria-pressed={cell.isSelected}
                              onClick={() => {
                                if (!cell.iso) return;
                                setSelectedDate(cell.iso);
                                setSelectedSlot(null);
                                setSelectedSlotIso(null);
                                setErrors({});
                              }}
                              className="aspect-square min-h-[48px] sm:min-h-[56px] rounded-2xl flex flex-col items-center justify-center text-base sm:text-lg font-semibold tabular-nums border-2 transition-all hover:shadow-sm"
                              style={
                                cell.isSelected
                                  ? {
                                      backgroundColor: accent,
                                      color: onBrand,
                                      borderColor: color,
                                    }
                                  : {
                                      backgroundColor: brandBg(color, 0.08),
                                      color: textColor,
                                      borderColor: brandBg(color, 0.22),
                                    }
                              }
                            >
                              <span>{cell.dayNumber}</span>
                              {cell.isToday && !cell.isSelected ? (
                                <span
                                  className="mt-0.5 h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-5 text-sm text-warm-gray text-center">
                        Available dates are highlighted. You can book up to{" "}
                        {BOOKING_WINDOW_DAYS} days ahead.
                      </p>
                    </div>
                  )}
                  {errors.day && (
                    <p className="text-red-600 text-sm mt-3">{errors.day}</p>
                  )}
                </div>
              )}

              {step === "time" && (
                <div>
                  {isSlotsLoading ? (
                    <div className="flex items-center gap-2 text-base text-warm-gray py-10 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Finding open times...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div
                      ref={optionsRef}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
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
                            className="min-h-[56px] px-4 py-4 rounded-2xl text-base font-semibold border-2 transition-all text-center hover:shadow-sm"
                            style={
                              isSelected
                                ? {
                                    backgroundColor: accent,
                                    color: onBrand,
                                    borderColor: color,
                                  }
                                : {
                                    backgroundColor: "#fff",
                                    color: "#2D2A26",
                                    borderColor: "#e8e4de",
                                  }
                            }
                          >
                            {slot.timeLabel}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock
                        className="h-12 w-12 mx-auto mb-4 opacity-30"
                        style={{ color }}
                      />
                      <p className="text-base text-warm-gray mb-4">
                        No open times on this date.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep("day")}
                        className="text-base font-semibold underline"
                        style={{ color: textColor }}
                      >
                        Choose another date
                      </button>
                    </div>
                  )}
                  {errors.time && (
                    <p className="text-red-600 text-sm mt-3">{errors.time}</p>
                  )}
                </div>
              )}

              {step === "details" && (
                <div className="space-y-5 max-w-lg">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        First name *
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
                        <input
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((f) => ({
                              ...f,
                              firstName: e.target.value,
                            }))
                          }
                          placeholder="Alex"
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
                        <p className="text-red-600 text-sm mt-1.5">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        Last name *
                      </label>
                      <input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Morgan"
                        className={`${inputBase} ${
                          errors.lastName
                            ? "border-red-400 bg-red-50"
                            : "border-warm-gray/20"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1.5">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, email: e.target.value }))
                        }
                        placeholder="alex@email.com"
                        className={`${inputWithIcon} ${
                          errors.email
                            ? "border-red-400 bg-red-50"
                            : "border-warm-gray/20"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1.5">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Phone *
                    </label>
                    <PhoneNumberInput
                      value={formData.phone}
                      onChange={(val) =>
                        setFormData((f) => ({ ...f, phone: val }))
                      }
                      error={errors.phone}
                      className="[&_.PhoneInput]:h-14 [&_.PhoneInput]:rounded-2xl [&_.PhoneInput]:px-4 [&_.PhoneInput]:text-base [&_.PhoneInput]:border-warm-gray/20"
                    />
                  </div>
                </div>
              )}

              {step === "confirm" && (
                <div>
                  <div className="rounded-2xl border border-warm-gray/15 overflow-hidden divide-y divide-warm-gray/10">
                    {[
                      {
                        label: "Service",
                        value: selectedSession?.name || "-",
                      },
                      {
                        label: "When",
                        value: selectedDate
                          ? `${formatIsoLong(selectedDate)} · ${selectedSlot || "-"}`
                          : "-",
                      },
                      { label: "Format", value: meetingLabel },
                      {
                        label: "Duration",
                        value: selectedSession?.durationLabel || "-",
                      },
                      {
                        label: "You",
                        value: `${formData.firstName} ${formData.lastName}`,
                      },
                      { label: "Email", value: formData.email },
                      { label: "Phone", value: formData.phone },
                      {
                        label: "Amount",
                        value: selectedSession?.priceLabel || "-",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start justify-between gap-4 px-5 py-4"
                      >
                        <span className="text-sm font-semibold text-warm-gray pt-0.5">
                          {item.label}
                        </span>
                        <span className="text-base font-semibold text-charcoal text-right max-w-[65%]">
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

              {step === "success" && (
                <div>
                  <div className="text-center mb-6">
                    <div
                      className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: brandBg(color, 0.12) }}
                    >
                      <CheckCircle className="h-8 w-8" style={{ color }} />
                    </div>
                    <h3 className="text-2xl font-serif text-charcoal">
                      Booking confirmed
                    </h3>
                    <p className="text-warm-gray text-base mt-2">
                      {clinician.name}
                      {selectedDate
                        ? ` · ${formatIsoLong(selectedDate)}`
                        : ""}
                      {selectedSlot ? ` · ${selectedSlot}` : ""}
                    </p>
                  </div>

                  {emailSent && (
                    <div className="flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 mb-4">
                      <Send className="h-4 w-4 text-blue-500 shrink-0" />
                      <p className="text-sm text-blue-700 font-medium">
                        Confirmation sent to{" "}
                        <strong>{formData.email}</strong>
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-warm-gray/15 overflow-hidden">
                    <div
                      className="p-4 flex items-center justify-between"
                      style={{ background: brandGradient(color) }}
                    >
                      <div>
                        <p className="text-white font-bold text-sm">
                          {clinicName}
                        </p>
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
                    <div className="px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3">
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
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-warm-gray/10 bg-cream/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          {step === "success" ? (
            <div className="flex gap-3 max-w-xl ml-auto">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="flex-1 flex items-center justify-center gap-2 py-4 border-2 font-semibold rounded-full text-base transition-all hover:opacity-80"
                style={{ borderColor: color, color }}
              >
                <Printer className="h-5 w-5" />
                Download invoice
              </button>
              <button
                type="button"
                onClick={() => navigate(`/clinic-portal/${linkId}`)}
                className="flex-1 py-4 font-semibold rounded-full text-base"
                style={{ backgroundColor: accent, color: onBrand }}
              >
                Done
              </button>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              {step !== "session" && (
                <button
                  type="button"
                  onClick={goToPrev}
                  className="flex items-center gap-2 px-5 sm:px-6 py-4 border border-warm-gray/20 text-charcoal font-semibold rounded-full hover:bg-warm-white transition-colors text-base"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <div className="flex-1" />
              {step !== "confirm" ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="min-w-[160px] sm:min-w-[200px] py-4 px-7 font-semibold rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-40 text-base"
                  style={{ backgroundColor: accent, color: onBrand }}
                >
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="min-w-[180px] sm:min-w-[220px] py-4 px-7 font-semibold rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-base"
                  style={{ backgroundColor: accent, color: onBrand }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" /> Confirm booking
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
