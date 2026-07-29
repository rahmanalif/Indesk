import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Video,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { useGetPublicClinicQuery } from "../../redux/api/clientsApi";
import {
  brandBg,
  brandStrong,
  brandText,
  readableTextOn,
  hexToHslToken,
} from "../../lib/branding";
import { useClinicPageMotion } from "../../hooks/useClinicPageMotion";

const DEFAULT_CLINIC_COLOR = "#779362";
const SHOWCASE_AVATAR = "/clinic/showcase-avatar.png";

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

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const dayShort = (day: string) => toTitleCase(day).slice(0, 3);

function roleToLabel(role?: string) {
  const normalized = (role || "").toLowerCase();
  if (normalized === "superadmin") return "Lead Clinician";
  if (normalized === "admin") return "Admin";
  if (normalized === "clinician") return "Clinician";
  return "Clinician";
}

function formatPrice(price: unknown, currency = "GBP") {
  const value = Number(price);
  if (!Number.isFinite(value)) return null;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `£${value}`;
  }
}

export function PublicClinicPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { branding } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const {
    data: clinicResponse,
    isLoading,
    isError,
  } = useGetPublicClinicQuery(linkId || "", {
    skip: !linkId,
    refetchOnMountOrArgChange: false,
  });
  const clinic = clinicResponse?.response?.data as any;

  useClinicPageMotion(pageRef, Boolean(clinic) && !isLoading && !isError);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const color =
    clinic?.color || branding.color || DEFAULT_CLINIC_COLOR;
  const accent = brandStrong(color);
  const textColor = brandText(color);
  const onBrand = readableTextOn(color);
  const slogan = (clinic?.description || "").trim();
  const brandStyle = { "--primary": hexToHslToken(color) } as CSSProperties;
  const clinicName = clinic?.name || "Clinic";
  const clinicLogo = resolveImageUrl(clinic?.logo) || branding.logo;
  const currency = clinic?.currency || "GBP";
  const clinicPhone =
    `${clinic?.countryCode || ""}${clinic?.phoneNumber || ""}`.trim() || "";
  const clinicEmail = (clinic?.email || "").trim();
  const clinicAddressObject = normalizeAddress(clinic?.address);
  const clinicAddress =
    [
      clinicAddressObject.street,
      clinicAddressObject.city,
      clinicAddressObject.state,
      clinicAddressObject.zip,
      clinicAddressObject.country,
    ]
      .map((part: string) => (part || "").trim())
      .filter(Boolean)
      .join(", ");

  const sessions = useMemo(() => {
    const rows = Array.isArray(clinic?.sessions) ? clinic.sessions : [];
    return rows.map((session: any) => ({
      id: session.id,
      name: session.name || "Session",
      duration: Number(session.duration) || null,
      priceLabel: formatPrice(session.price, currency),
    }));
  }, [clinic?.sessions, currency]);

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
        const rawSchedule = Array.isArray(member?.availabilitySchedule)
          ? member.availabilitySchedule
          : [];
        const days = rawSchedule
          .map((item: any) =>
            typeof item?.day === "string" ? item.day.toLowerCase() : ""
          )
          .filter(Boolean);
        const uniqueDays = Array.from(new Set(days)) as string[];
        const specialization = Array.isArray(member?.specialization)
          ? member.specialization.filter(Boolean)
          : [];
        const hours =
          rawSchedule[0]?.startTime && rawSchedule[0]?.endTime
            ? `${rawSchedule[0].startTime} – ${rawSchedule[0].endTime}`
            : null;

        return {
          id: member.id,
          name: fullName,
          role: roleToLabel(member?.role),
          specialty: specialization.join(", "),
          bio: (member?.user?.bio || "").trim(),
          avatar: resolveImageUrl(member?.user?.avatar),
          availabilityDays: uniqueDays.map(toTitleCase),
          hours,
        };
      });
  }, [clinic?.members, apiOrigin]);

  const featured = clinicians[0];
  const meetingModes = [
    clinic?.isZoomAvailable ? "Zoom" : null,
    clinic?.isMeetAvailable ? "Google Meet" : null,
    "In person",
  ].filter(Boolean) as string[];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-warm-gray">
        Loading clinic...
      </div>
    );
  }

  if (isError || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-warm-gray">
        Unable to load clinic details.
      </div>
    );
  }

  const goClinician = (id: string) =>
    navigate(`/clinic-portal/${linkId}/clinician/${id}/book`);

  return (
    <div
      ref={pageRef}
      className="min-h-screen w-full bg-cream text-charcoal font-sans selection:bg-terracotta/20"
      style={brandStyle}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#2D2A26 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-cream/90 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt=""
                className="h-10 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span className="font-serif text-2xl font-bold tracking-tight text-charcoal truncate">
                {clinicName}
              </span>
            )}
            {clinicLogo && (
              <span className="font-serif text-xl font-bold text-charcoal truncate hidden sm:block">
                {clinicName}
              </span>
            )}
          </div>
          <a
            href="#book"
            className="shrink-0 text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm"
            style={{ backgroundColor: accent, color: onBrand }}
          >
            Book now
          </a>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero — one composition */}
        <section className="relative min-h-[88svh] flex items-center pt-28 pb-16 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[58%] h-full hidden lg:block"
            style={{
              background: `linear-gradient(160deg, ${brandBg(color, 0.22)} 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute -top-24 -right-16 w-[420px] h-[420px] rounded-full blur-3xl opacity-50 hidden lg:block"
            style={{ backgroundColor: brandBg(color, 0.55) }}
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-3 mb-7" data-animate="hero">
                <span
                  className="h-px w-10"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="text-xs font-bold tracking-[0.18em] uppercase"
                  style={{ color: textColor }}
                >
                  Online booking
                </span>
              </div>

              <h1
                className="font-serif text-5xl sm:text-6xl lg:text-[4.5rem] font-medium text-charcoal leading-[1.05] tracking-tight mb-6"
                data-animate="hero"
              >
                {clinicName}
              </h1>

              <p
                className="text-lg sm:text-xl text-warm-gray max-w-xl leading-relaxed mb-9"
                data-animate="hero"
              >
                {slogan ||
                  "Book a session with our team — choose a clinician and a time that works for you."}
              </p>

              <div
                className="flex flex-col sm:flex-row sm:items-center gap-4"
                data-animate="hero"
              >
                <a
                  href="#book"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: accent, color: onBrand }}
                >
                  Book an appointment
                  <ArrowRight className="h-4 w-4" />
                </a>
                {(clinicPhone || clinicEmail) && (
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center px-6 py-4 rounded-full text-base font-medium border border-warm-gray/25 text-charcoal hover:bg-white/70 transition-colors"
                  >
                    Contact us
                  </a>
                )}
              </div>

              {meetingModes.length > 0 && (
                <div
                  className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-warm-gray"
                  data-animate="hero"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="h-4 w-4" style={{ color: textColor }} />
                    {meetingModes.join(" · ")}
                  </span>
                </div>
              )}
            </div>

            <div className="lg:col-span-5" data-animate="hero-visual">
              <div
                className="relative rounded-[2rem] overflow-hidden aspect-[4/5] max-w-md mx-auto lg:ml-auto shadow-xl border border-white/40 bg-warm-white"
              >
                <img
                  src={featured?.avatar || SHOWCASE_AVATAR}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />

                {featured && (
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-white font-serif text-xl">
                      {featured.name}
                    </p>
                    <p className="text-white/80 text-sm mt-1">
                      {featured.role}
                      {featured.hours ? ` · ${featured.hours}` : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Book / clinicians */}
        <section
          id="book"
          className="py-20 sm:py-24 scroll-mt-24 bg-white border-y border-warm-gray/10"
          data-animate="section"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12" data-animate="item">
              <span
                className="text-xs font-bold tracking-[0.18em] uppercase block mb-3"
                style={{ color: textColor }}
              >
                {clinicians.length === 1 ? "Your clinician" : "Our team"}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-3">
                {clinicians.length === 1
                  ? `Book with ${featured?.name?.split(" ")[0] || "us"}`
                  : "Choose who you’d like to see"}
              </h2>
              <p className="text-warm-gray text-lg">
                Pick a clinician to book a session.
              </p>
            </div>

            {clinicians.length === 0 ? (
              <p className="text-warm-gray" data-animate="item">
                Booking isn’t open yet. Please check back soon.
              </p>
            ) : clinicians.length === 1 && featured ? (
              <div
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
                data-animate="item"
              >
                <div className="lg:col-span-5">
                  <div className="rounded-3xl overflow-hidden bg-warm-white border border-warm-gray/10 aspect-square max-w-sm">
                    <img
                      src={featured.avatar || SHOWCASE_AVATAR}
                      alt=""
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
                <div className="lg:col-span-7 pt-1">
                  <h3 className="font-serif text-3xl text-charcoal mb-2">
                    {featured.name}
                  </h3>
                  <p className="text-sm font-medium mb-5" style={{ color: textColor }}>
                    {featured.role}
                    {featured.specialty ? ` · ${featured.specialty}` : ""}
                  </p>
                  {featured.bio ? (
                    <p className="text-warm-gray leading-relaxed mb-6 max-w-xl">
                      {featured.bio}
                    </p>
                  ) : null}

                  {featured.availabilityDays.length > 0 && (
                    <div className="mb-8">
                      <p className="text-xs font-bold uppercase tracking-widest text-warm-gray mb-3">
                        Available days
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {featured.availabilityDays.map((day: string) => (
                          <span
                            key={day}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-cream border border-warm-gray/15 text-charcoal"
                          >
                            {dayShort(day)}
                          </span>
                        ))}
                      </div>
                      {featured.hours && (
                        <p className="text-sm text-warm-gray mt-3 inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Typically {featured.hours}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => goClinician(featured.id)}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    style={{ backgroundColor: accent, color: onBrand }}
                  >
                    Book an appointment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clinicians.map((clinician: any) => (
                  <button
                    key={clinician.id}
                    type="button"
                    data-animate="item"
                    onClick={() => goClinician(clinician.id)}
                    className="group text-left rounded-3xl border border-warm-gray/10 bg-cream/60 hover:bg-cream p-6 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      {clinician.avatar ? (
                        <img
                          src={clinician.avatar}
                          alt=""
                          className="h-16 w-16 rounded-2xl object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="h-16 w-16 rounded-2xl flex items-center justify-center font-serif text-xl shrink-0"
                          style={{
                            backgroundColor: brandBg(color, 0.15),
                            color: textColor,
                          }}
                        >
                          {clinician.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-2xl text-charcoal mb-1">
                          {clinician.name}
                        </h3>
                        <p className="text-sm text-warm-gray mb-3">
                          {clinician.role}
                          {clinician.specialty
                            ? ` · ${clinician.specialty}`
                            : ""}
                        </p>
                        {clinician.bio ? (
                          <p className="text-sm text-warm-gray line-clamp-2 mb-4">
                            {clinician.bio}
                          </p>
                        ) : null}
                        <span
                          className="inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all"
                          style={{ color: textColor }}
                        >
                          Book
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Sessions */}
        {sessions.length > 0 && (
          <section
            className="py-20 sm:py-24 bg-warm-white/60 border-y border-warm-gray/10"
            data-animate="section"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                <div className="lg:col-span-4 max-w-md" data-animate="item">
                  <span
                    className="text-xs font-bold tracking-[0.18em] uppercase block mb-3"
                    style={{ color: textColor }}
                  >
                    Sessions
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-3 leading-tight">
                    What you can book
                  </h2>
                  <p className="text-warm-gray text-lg leading-relaxed">
                    Session types offered at {clinicName}.
                  </p>
                  {clinicians.length > 0 && (
                    <a
                      href="#book"
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: textColor }}
                    >
                      Book a session
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <div className="lg:col-span-8" data-animate="item">
                  <ul className="divide-y divide-warm-gray/15 border-y border-warm-gray/15">
                    {sessions.map((session: any) => (
                      <li
                        key={session.id}
                        className="flex items-center justify-between gap-6 py-5 sm:py-6"
                      >
                        <div className="min-w-0">
                          <p className="font-serif text-xl sm:text-2xl text-charcoal tracking-tight">
                            {session.name}
                          </p>
                          {session.duration ? (
                            <p className="mt-1.5 text-sm text-warm-gray inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {session.duration} minutes
                            </p>
                          ) : null}
                        </div>
                        {session.priceLabel ? (
                          <p
                            className="shrink-0 font-serif text-xl sm:text-2xl tabular-nums"
                            style={{ color: textColor }}
                          >
                            {session.priceLabel}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact — only real fields */}
        {(clinicPhone || clinicEmail || clinicAddress) && (
          <section
            id="contact"
            className="py-20 sm:py-24 bg-warm-white/70 border-t border-warm-gray/10 scroll-mt-24"
            data-animate="section"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mb-10" data-animate="item">
                <span
                  className="text-xs font-bold tracking-[0.18em] uppercase block mb-3"
                  style={{ color: textColor }}
                >
                  Contact
                </span>
                <h2 className="font-serif text-3xl text-charcoal">
                  Get in touch with {clinicName}
                </h2>
              </div>

              <div
                className="flex flex-col sm:flex-row flex-wrap gap-x-14 gap-y-8"
                data-animate="item"
              >
                {clinicPhone && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-warm-gray mb-2 inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </p>
                    <a
                      href={`tel:${clinicPhone}`}
                      className="text-xl text-charcoal font-medium hover:opacity-70 transition-opacity"
                    >
                      {clinicPhone}
                    </a>
                  </div>
                )}
                {clinicEmail && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-warm-gray mb-2 inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </p>
                    <a
                      href={`mailto:${clinicEmail}`}
                      className="text-lg text-charcoal font-medium hover:opacity-70 transition-opacity break-all"
                    >
                      {clinicEmail}
                    </a>
                  </div>
                )}
                {clinicAddress && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-warm-gray mb-2 inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Visit
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(clinicAddress)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg text-charcoal font-medium hover:opacity-70 transition-opacity"
                    >
                      {clinicAddress}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-warm-gray/10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-warm-gray">
          <p>
            © {new Date().getFullYear()} {clinicName}
          </p>
          <p className="text-warm-gray/70">Powered by InDesk</p>
        </div>
      </footer>
    </div>
  );
}
