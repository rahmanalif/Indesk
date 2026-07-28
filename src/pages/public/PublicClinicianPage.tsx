import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Layers, Mail, Phone, Star } from "lucide-react";
import { WeekAvailabilityTimeline } from "../../components/clinicians/WeekAvailabilityTimeline";
import { normalizeDay } from "../../lib/clinicianAvailability";
import { useData } from "../../context/DataContext";
import {
  clientsApi,
  useGetPublicClinicQuery,
  useGetSessionsByClinicianTokenQuery,
} from "../../redux/api/clientsApi";
import { useDispatch } from "react-redux";
import {
  brandBg,
  brandText,
  hexToHslToken,
  readableTextOn,
} from "../../lib/branding";
import type { BookAppointmentLocationState } from "./PublicBookAppointmentPage";

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

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

function roleToLabel(role?: string) {
  const normalized = (role || "").toLowerCase();
  if (normalized === "superadmin") return "Lead Clinician";
  if (normalized === "admin") return "Admin";
  if (normalized === "clinician") return "Clinician";
  return "Clinician";
}

export function PublicClinicianPage() {
  const { linkId, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { branding, sessionTypes: fallbackSessionTypes } = useData();
  const { data: clinicResponse, isLoading, isError } = useGetPublicClinicQuery(
    linkId || "",
    {
      skip: !linkId,
      refetchOnMountOrArgChange: false,
    }
  );
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

  const color = clinic?.color || branding.color || "#0066FF";
  const textColor = brandText(color);
  const onBrand = readableTextOn(color);
  const brandStyle = { "--primary": hexToHslToken(color) } as CSSProperties;
  const clinicName = clinic?.name || "Clinic";
  const clinicLogo = resolveImageUrl(clinic?.logo) || branding.logo;
  const clinicPhone =
    `${clinic?.countryCode || ""}${clinic?.phoneNumber || ""}`.trim() || "-";

  const clinicians = useMemo(() => {
    const members = clinic?.members || [];
    return members
      .filter((member: any) => {
        const role = (member?.role || "").toLowerCase();
        return (
          role === "clinician" || role === "superadmin" || role === "admin"
        );
      })
      .map((member: any) => {
        const firstName = member?.user?.firstName || "";
        const lastName = member?.user?.lastName || "";
        const fullName =
          [firstName, lastName].filter(Boolean).join(" ") || "Clinician";
        const rawAvailabilitySchedule = Array.isArray(
          member?.availabilitySchedule
        )
          ? member.availabilitySchedule
          : [];
        const availabilityMap = new Map<string, any>();
        rawAvailabilitySchedule.forEach((item: any) => {
          const dayValue =
            typeof item?.day === "string" ? item.day.toLowerCase() : "";
          if (!dayValue || availabilityMap.has(dayValue)) return;
          availabilityMap.set(dayValue, item);
        });
        const availabilityDays = Array.from(availabilityMap.values());
        const specialization = Array.isArray(member?.specialization)
          ? member.specialization
          : [];

        return {
          id: member.id,
          clinicianToken: member?.clinicianToken || "",
          name: `Dr. ${fullName}`.trim(),
          role: roleToLabel(member?.role),
          specialty:
            specialization.length > 0
              ? specialization.join(", ")
              : "General Psychology",
          bio:
            member?.user?.bio ||
            "Experienced clinician focused on compassionate, evidence-based care.",
          email: member?.user?.email || clinic?.email || "-",
          phone:
            `${member?.user?.countryCode || ""}${member?.user?.phoneNumber || ""}`.trim() ||
            clinicPhone,
          status: availabilityDays.length > 0 ? "Available" : "Offline",
          availability: availabilityDays.map((item: any) => ({
            day: toTitleCase(item.day),
            startTime: item?.startTime || "",
            endTime: item?.endTime || "",
            breakTime: item?.breakTime || null,
            slots: item?.startTime ? [formatTime(item.startTime)] : [],
          })),
        };
      });
  }, [clinic?.members, clinic?.email, clinicPhone]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const clinician = clinicians.find((c: any) => String(c.id) === String(id));
  const clinicianToken = clinician?.clinicianToken || "";
  const { data: clinicianSessionsResponse, isLoading: isSessionsLoading } =
    useGetSessionsByClinicianTokenQuery(clinicianToken, {
      skip: !clinicianToken,
      refetchOnMountOrArgChange: false,
    });

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
        durationLabel: `${durationMinutes} min`,
        priceLabel:
          Number.isFinite(priceNumber) && priceNumber >= 0
            ? `£${priceNumber}`
            : session?.price || "-",
      };
    });
  }, [clinicianSessionsResponse]);

  const parsedFallbackSessions = useMemo(() => {
    return fallbackSessionTypes.map((session) => ({
      id: session.id,
      name: session.name,
      durationLabel: session.duration || "50 min",
      priceLabel: session.price || "-",
    }));
  }, [fallbackSessionTypes]);

  const sessionOptions =
    parsedApiSessions.length > 0 ? parsedApiSessions : parsedFallbackSessions;

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
    const todayDay = today.getDay();
    const targetDay = days.indexOf(dayName);
    let daysUntil = targetDay - todayDay;
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

  const getDayDate = (dayName: string) => {
    const iso = getDayIsoDate(dayName);
    return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Prefetch slots for selected day so the book page hits warm cache
  useEffect(() => {
    if (!clinicianToken || !selectedDay) return;
    const date = getDayIsoDate(selectedDay);
    dispatch(
      clientsApi.util.prefetch(
        "getPublicAvailableSlots",
        { clinicianToken, date },
        { force: false }
      ) as any
    );
    sessionOptions.forEach((session: any) => {
      dispatch(
        clientsApi.util.prefetch(
          "getPublicAvailableSlots",
          {
            clinicianToken,
            date,
            sessionId: String(session.id),
          },
          { force: false }
        ) as any
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicianToken, selectedDay, dispatch, sessionOptions.length]);

  const goToBook = (state?: BookAppointmentLocationState) => {
    navigate(`/clinic-portal/${linkId}/clinician/${id}/book`, {
      state: state || {},
    });
  };

  const handleSessionClick = (day: string, sessionId: string | number) => {
    const defaultTime =
      clinician?.availability.find((a: any) => a.day === day)?.slots?.[0] ||
      null;
    goToBook({
      day,
      sessionId,
      time: defaultTime,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-warm-gray">
        Loading clinician profile...
      </div>
    );
  }

  if (isError || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-warm-gray">
        Unable to load clinic data.
      </div>
    );
  }

  if (!clinician) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <p className="text-warm-gray text-lg">Clinician not found.</p>
          <button
            type="button"
            onClick={() => navigate(`/clinic-portal/${linkId}`)}
            className="mt-4 hover:underline text-sm font-medium"
            style={{ color: textColor }}
          >
            Back to clinic
          </button>
        </div>
      </div>
    );
  }

  const availability = clinician.availability || [];
  const selectedAvailability = availability.find(
    (item: any) => item.day === selectedDay
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
      <div
        className="pointer-events-none absolute top-0 right-0 w-1/2 h-[50vh] rounded-bl-[80px]"
        style={{
          background: `linear-gradient(to bottom left, ${brandBg(color, 0.28)}, transparent)`,
        }}
      />

      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-warm-gray/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt=""
                className="h-9 w-9 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center font-serif font-bold text-sm shrink-0"
                style={{ backgroundColor: color, color: onBrand }}
              >
                {clinicName[0]}
              </div>
            )}
            <button
              type="button"
              onClick={() => navigate(`/clinic-portal/${linkId}`)}
              className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70 truncate"
              style={{ color: textColor }}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">Back to {clinicName}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() =>
              goToBook(selectedDay ? { day: selectedDay } : undefined)
            }
            className="px-5 py-2.5 text-sm font-medium rounded-full transition-all shadow-sm hover:shadow-md shrink-0"
            style={{ backgroundColor: color, color: onBrand }}
          >
            Book appointment
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <div
                  className="h-24 w-24 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl mb-5"
                  style={{
                    backgroundColor: brandBg(color, 0.12),
                    color: textColor,
                  }}
                >
                  {clinician.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <h1 className="font-serif text-3xl text-charcoal mb-1">
                  {clinician.name}
                </h1>
                <p
                  className="font-medium text-sm mb-3"
                  style={{ color: textColor }}
                >
                  {clinician.role}
                </p>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border mb-6"
                  style={{
                    backgroundColor: brandBg(color, 0.1),
                    color: textColor,
                    borderColor: brandBg(color, 0.2),
                  }}
                >
                  <Star className="h-3 w-3 fill-current" />
                  {clinician.specialty}
                </div>
                <div className="space-y-3 text-sm text-warm-gray border-t border-warm-gray/15 pt-5">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 opacity-60" />
                    <span className="truncate">{clinician.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 opacity-60" />
                    <span>{clinician.phone}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  goToBook(selectedDay ? { day: selectedDay } : undefined)
                }
                className="w-full py-3.5 font-medium rounded-full transition-all shadow-md hover:shadow-lg text-sm inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: color, color: onBrand }}
              >
                Book an appointment
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>

          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">
                About
              </h2>
              <p className="text-warm-gray leading-relaxed text-[15px]">
                {clinician.bio}
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5" style={{ color: textColor }} />
                Weekly availability
              </h2>
              <p className="text-warm-gray text-sm mb-6">
                Tap a working day, then choose a session to continue booking.
              </p>

              {availability.length > 0 ? (
                <div className="mb-6">
                  <WeekAvailabilityTimeline
                    schedule={availability.map((avail: any) => ({
                      day: avail.day,
                      startTime: avail.startTime,
                      endTime: avail.endTime,
                      breakStartTime: avail.breakTime?.startTime || "",
                      breakEndTime: avail.breakTime?.endTime || "",
                    }))}
                    accentColor={color}
                    selectedDay={selectedDay}
                    onSelectDay={(dayValue) => {
                      const match = availability.find(
                        (item: any) => normalizeDay(item.day) === dayValue
                      );
                      const label = match?.day || null;
                      setSelectedDay((current: string | null) =>
                        current === label ? null : label
                      );
                    }}
                  />
                </div>
              ) : (
                <p className="mb-6 rounded-2xl border border-warm-gray/15 bg-warm-white px-4 py-6 text-center text-sm text-warm-gray">
                  This clinician has not published availability yet.
                </p>
              )}

              {selectedDay ? (
                <div>
                  <p className="text-xs text-warm-gray uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" /> Sessions —{" "}
                    {getDayDate(selectedDay)}
                  </p>
                  {selectedAvailability && (
                    <div className="mb-4 rounded-2xl border border-warm-gray/15 bg-warm-white px-4 py-3 text-sm text-warm-gray">
                      <div className="flex flex-wrap items-center gap-4">
                        <span>
                          <strong className="text-charcoal">
                            Working hours:
                          </strong>{" "}
                          {formatTime(selectedAvailability.startTime)} –{" "}
                          {formatTime(selectedAvailability.endTime)}
                        </span>
                        {selectedAvailability.breakTime?.startTime &&
                          selectedAvailability.breakTime?.endTime && (
                            <span>
                              <strong className="text-charcoal">Break:</strong>{" "}
                              {formatTime(
                                selectedAvailability.breakTime.startTime
                              )}{" "}
                              –{" "}
                              {formatTime(
                                selectedAvailability.breakTime.endTime
                              )}
                            </span>
                          )}
                      </div>
                    </div>
                  )}
                  {isSessionsLoading && (
                    <p className="text-xs text-warm-gray mb-3">
                      Loading sessions...
                    </p>
                  )}
                  {sessionOptions.length > 0 ? (
                    <div className="space-y-3">
                      {sessionOptions.map((session: any) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() =>
                            handleSessionClick(selectedDay, session.id)
                          }
                          className="w-full text-left py-4 px-5 rounded-2xl font-medium text-sm flex items-center justify-between gap-3 transition-all border hover:shadow-sm group"
                          style={{
                            backgroundColor: brandBg(color, 0.06),
                            color: textColor,
                            borderColor: brandBg(color, 0.18),
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <Layers className="h-4 w-4 shrink-0" />
                            {session.name}
                          </span>
                          <span className="flex items-center gap-3 text-xs opacity-80">
                            <span>
                              {session.durationLabel} · {session.priceLabel}
                            </span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-warm-gray text-sm">
                      No sessions available for this clinician yet.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: brandBg(color, 0.1) }}
                  >
                    <Calendar
                      className="h-8 w-8 opacity-30"
                      style={{ color }}
                    />
                  </div>
                  <p className="text-warm-gray font-medium">
                    Select a day above to view available sessions
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
