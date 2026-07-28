import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useGetPublicClinicQuery } from "../../redux/api/clientsApi";
import {
  brandBg,
  brandText,
  readableTextOn,
  hexToHslToken,
} from "../../lib/branding";
import { useInView } from "../../hooks/landing/useInView";

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

function roleToLabel(role?: string) {
  const normalized = (role || "").toLowerCase();
  if (normalized === "superadmin") return "Lead Clinician";
  if (normalized === "admin") return "Admin";
  if (normalized === "clinician") return "Clinician";
  return "Clinician";
}

export function PublicClinicPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { branding } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const { ref: heroRef, isInView: heroInView } = useInView();
  const { ref: teamRef, isInView: teamInView } = useInView();

  const {
    data: clinicResponse,
    isLoading,
    isError,
  } = useGetPublicClinicQuery(linkId || "", {
    skip: !linkId,
    refetchOnMountOrArgChange: false,
  });
  const clinic = clinicResponse?.response?.data;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
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

  const color = clinic?.color || branding.color || "#0066FF";
  const textColor = brandText(color);
  const onBrand = readableTextOn(color);
  const slogan = (clinic?.description || "").trim();
  const brandStyle = { "--primary": hexToHslToken(color) } as CSSProperties;
  const clinicName = clinic?.name || "Clinic";
  const clinicLogo = resolveImageUrl(clinic?.logo) || branding.logo;
  const clinicPhone =
    `${clinic?.countryCode || ""}${clinic?.phoneNumber || ""}`.trim() || "";
  const clinicEmail = clinic?.email || "";
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
        const daysSet = new Set<string>();
        rawSchedule.forEach((item: any) => {
          if (item?.day && typeof item.day === "string") {
            daysSet.add(item.day.toLowerCase());
          }
        });
        const availabilityDays = Array.from(daysSet);
        const specialization = Array.isArray(member?.specialization)
          ? member.specialization
          : [];

        return {
          id: member.id,
          name: `Dr. ${fullName}`.trim(),
          role: roleToLabel(member?.role),
          specialty:
            specialization.length > 0
              ? specialization.join(", ")
              : "General Psychology",
          bio:
            member?.user?.bio ||
            "Experienced clinician focused on compassionate, evidence-based care.",
          availabilityDays: availabilityDays.map(toTitleCase),
        };
      });
  }, [clinic?.members]);

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

  const canCall = Boolean(clinicPhone);
  const canEmail = Boolean(clinicEmail);
  const canVisit = Boolean(clinicAddress);

  return (
    <div
      className="min-h-screen w-full bg-cream text-charcoal font-sans selection:bg-black/10"
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
        className="pointer-events-none absolute top-0 right-0 w-2/3 h-[70vh] rounded-bl-[100px] -z-0"
        style={{
          background: `linear-gradient(to bottom left, ${brandBg(color, 0.35)}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute top-24 right-16 w-64 h-64 rounded-full blur-3xl -z-0 opacity-40"
        style={{ backgroundColor: brandBg(color, 0.45) }}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-cream/90 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt={clinicName}
                className="h-10 w-10 rounded-xl object-cover"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center font-serif font-bold text-lg"
                style={{ backgroundColor: color, color: onBrand }}
              >
                {clinicName[0]}
              </div>
            )}
            <span className="font-serif font-bold text-charcoal text-lg tracking-tight truncate">
              {clinicName}
            </span>
          </div>
          <a
            href="#clinicians"
            className="hidden sm:inline-flex text-sm font-medium text-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: color }}
          >
            Book an appointment
          </a>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="relative min-h-[100svh] flex items-center pt-28 pb-20 overflow-hidden">
          <div
            ref={heroRef}
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full transition-all duration-1000 ${
              heroInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-6">
                <span
                  className="h-px w-8"
                  style={{ backgroundColor: color }}
                />
                <span
                  className="font-bold tracking-widest text-xs uppercase"
                  style={{ color: textColor }}
                >
                  Care that fits your life
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-charcoal leading-[1.08] text-balance mb-6">
                {clinicName}
              </h1>

              {slogan ? (
                <p className="text-lg text-warm-gray max-w-xl leading-relaxed mb-10">
                  {slogan}
                </p>
              ) : (
                <p className="text-lg text-warm-gray max-w-xl leading-relaxed mb-10">
                  Thoughtful clinical care from clinicians who know your clinic
                  — book a session when it suits you.
                </p>
              )}

              <a
                href="#clinicians"
                className="inline-flex items-center gap-2 text-white text-base font-medium px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                style={{ backgroundColor: color }}
              >
                Book an appointment
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="clinicians"
          className="py-24 scroll-mt-24 border-t border-warm-gray/10"
        >
          <div
            ref={teamRef}
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
              teamInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-2xl mb-14">
              <span
                className="font-bold tracking-widest text-xs uppercase block mb-4"
                style={{ color: textColor }}
              >
                Our team
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
                {clinicians.length === 1
                  ? "Meet your clinician"
                  : "Choose a clinician"}
              </h2>
              <p className="text-lg text-warm-gray">
                Select someone to see availability and book a session.
              </p>
            </div>

            {clinicians.length === 0 ? (
              <p className="text-warm-gray">
                No clinicians are available for booking yet.
              </p>
            ) : (
              <div className="space-y-0 divide-y divide-warm-gray/15">
                {clinicians.map((clinician: any) => (
                  <button
                    key={clinician.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/clinic-portal/${linkId}/clinician/${clinician.id}`
                      )
                    }
                    className="group w-full text-left py-8 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-warm-white/60 -mx-2 px-2 sm:-mx-4 sm:px-4 rounded-2xl transition-colors"
                  >
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center font-serif font-bold text-xl shrink-0 transition-transform duration-300 group-hover:scale-105"
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-2xl text-charcoal mb-1">
                        {clinician.name}
                      </h3>
                      <p className="text-sm font-medium text-warm-gray mb-2">
                        {clinician.role}
                        {clinician.specialty
                          ? ` · ${clinician.specialty}`
                          : ""}
                      </p>
                      <p className="text-warm-gray text-sm leading-relaxed line-clamp-2 max-w-2xl">
                        {clinician.bio}
                      </p>
                      {clinician.availabilityDays.length > 0 && (
                        <p className="mt-3 text-xs text-warm-gray">
                          Available{" "}
                          {clinician.availabilityDays.slice(0, 4).join(", ")}
                          {clinician.availabilityDays.length > 4 ? "…" : ""}
                        </p>
                      )}
                    </div>
                    <span
                      className="inline-flex items-center gap-2 text-sm font-medium shrink-0 group-hover:gap-3 transition-all"
                      style={{ color: textColor }}
                    >
                      View & book
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-20 border-t border-warm-gray/10 bg-warm-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span
                className="font-bold tracking-widest text-xs uppercase block mb-4"
                style={{ color: textColor }}
              >
                Get in touch
              </span>
              <h2 className="text-3xl font-serif text-charcoal">
                Contact {clinicName}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-warm-gray mb-3">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </div>
                {canCall ? (
                  <a
                    href={`tel:${clinicPhone}`}
                    className="text-charcoal font-medium hover:opacity-70 transition-opacity"
                  >
                    {clinicPhone}
                  </a>
                ) : (
                  <p className="text-warm-gray">Not available</p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-warm-gray mb-3">
                  <Mail className="h-3.5 w-3.5" /> Email
                </div>
                {canEmail ? (
                  <a
                    href={`mailto:${clinicEmail}`}
                    className="text-charcoal font-medium hover:opacity-70 transition-opacity break-all"
                  >
                    {clinicEmail}
                  </a>
                ) : (
                  <p className="text-warm-gray">Not available</p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-warm-gray mb-3">
                  <MapPin className="h-3.5 w-3.5" /> Visit
                </div>
                {canVisit ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(clinicAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-charcoal font-medium hover:opacity-70 transition-opacity"
                  >
                    {clinicAddress}
                  </a>
                ) : (
                  <p className="text-warm-gray">Not available</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-warm-gray/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-warm-gray">
          © {new Date().getFullYear()} {clinicName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
