import { useMemo, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { useGetPublicClinicQuery } from "../../redux/api/clientsApi";
import {
  brandGradient,
  brandBg,
  brandText,
  brandStrong,
  readableTextOn,
  hexToHslToken,
} from "../../lib/branding";

const DEFAULT_DAY_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "03:30 PM",
];

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

export function PublicClinicPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { branding } = useData();
  const {
    data: clinicResponse,
    isLoading,
    isError,
  } = useGetPublicClinicQuery(linkId || "", {
    skip: !linkId,
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

  const color = clinic?.color || branding.color || "#0066FF";
  const textColor = brandText(color);
  const onBrand = readableTextOn(color);
  const slogan = (clinic?.description || "").trim();
  const brandStyle = { "--primary": hexToHslToken(color) } as CSSProperties;
  const clinicName = clinic?.name || "Clinic";
  const clinicLogo = resolveImageUrl(clinic?.logo) || branding.logo;
  const clinicPhone =
    `${clinic?.countryCode || ""}${clinic?.phoneNumber || ""}`.trim() || "-";
  const clinicEmail = clinic?.email || "-";
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
      .join(", ") || "-";

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
        const rawSchedule = Array.isArray(member?.availabilitySchedule) ? member.availabilitySchedule : [];
        const daysSet = new Set<string>();
        rawSchedule.forEach((item: any) => {
          if (item?.day && typeof item.day === 'string') {
            daysSet.add(item.day.toLowerCase());
          }
        });
        const availabilityDays = Array.from(daysSet);
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
          email: member?.user?.email || clinicEmail,
          phone:
            `${member?.user?.countryCode || ""}${member?.user?.phoneNumber || ""}`.trim() ||
            clinicPhone,
          status: availabilityDays.length > 0 ? "Available" : "Offline",
          availability: availabilityDays.map((day: string) => ({
            day: toTitleCase(day),
            slots: DEFAULT_DAY_SLOTS,
          })),
        };
      });
  }, [clinic?.members, clinicEmail, clinicPhone]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading clinic...
      </div>
    );
  }

  if (isError || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Unable to load clinic details.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
      style={brandStyle}
    >
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt="Logo"
                className="h-9 w-9 rounded-xl object-cover shadow-md"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-lg shadow-md"
                style={{ background: brandGradient(color), color: onBrand }}
              >
                {clinicName[0]}
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">
                {clinicName}
              </p>
              {slogan && (
                <p
                  className="text-[10px] text-slate-500 uppercase tracking-widest font-medium truncate max-w-[200px] sm:max-w-[300px]"
                  title={slogan}
                >
                  {slogan}
                </p>
              )}
            </div>
          </div>
          <a
            href={
              clinicPhone &&
              clinicPhone !== "-" &&
              clinicPhone !== "Not provided"
                ? `tel:${clinicPhone}`
                : undefined
            }
            className={`hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm ${clinicPhone && clinicPhone !== "-" && clinicPhone !== "Not provided" ? "hover:opacity-90" : "opacity-50 pointer-events-none cursor-not-allowed"}`}
            style={{ background: brandStrong(color), color: onBrand }}
          >
            <Phone className="h-3.5 w-3.5" />
            Call Us
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: brandGradient(color) }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('/hero-illustration.jpg')" }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            {clinicName}
          </h1>
          {slogan && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              {slogan}
            </p>
          )}
          <a
            href="#clinicians"
            className="px-8 py-4 bg-white font-bold rounded-2xl hover:bg-white/90 transition-all shadow-xl inline-flex items-center gap-2 justify-center"
            style={{ color: textColor }}
          >
            Meet Our Clinicians <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Phone, label: "Phone", value: clinicPhone },
            { icon: Mail, label: "Email", value: clinicEmail },
            { icon: MapPin, label: "Address", value: clinicAddress },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 flex items-center gap-4 hover:shadow-xl transition-shadow"
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: brandBg(color, 0.1),
                  color: textColor,
                }}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {item.value &&
                  item.value !== "-" &&
                  item.value !== "Not provided"
                    ? item.value
                    : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="clinicians" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 border"
            style={{
              backgroundColor: brandBg(color, 0.08),
              color: textColor,
              borderColor: brandBg(color, 0.2),
            }}
          >
            <Users className="h-3.5 w-3.5" />{" "}
            {clinicians.length === 1 ? "Our Expert" : "Our Team"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {clinicians.length === 1
              ? "Meet Our Clinician"
              : "Meet Our Clinicians"}
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            {clinicians.length === 1
              ? "Book a session and start your journey towards better mental wellness."
              : "Each specialist brings deep expertise and genuine compassion. Click a clinician to view availability and book."}
          </p>
        </div>

        {clinicians.length === 1 ? (
          <div
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow max-w-3xl mx-auto flex flex-col sm:flex-row"
          >
            <div className="p-8 sm:w-1/3 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50">
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center font-bold text-3xl mb-4"
                style={{
                  backgroundColor: brandBg(color, 0.1),
                  color: textColor,
                }}
              >
                {clinicians[0].name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm">
                <Star className="h-3 w-3" />
                {clinicians[0].specialty}
              </div>
            </div>

            <div className="p-8 sm:w-2/3 flex flex-col justify-center">
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 text-2xl">
                  {clinicians[0].name}
                </h3>
                <p className="font-medium text-sm text-slate-500 mt-1">
                  {clinicians[0].role}
                </p>
              </div>

              <p className="text-slate-600 text-base leading-relaxed mb-6">
                {clinicians[0].bio}
              </p>

              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" /> Available Days
                </p>
                <div className="flex flex-wrap gap-2">
                  {clinicians[0].availability.length > 0 ? (
                    clinicians[0].availability.map((a: any) => (
                      <span
                        key={a.day}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg border border-slate-200/60"
                      >
                        {a.day}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm italic">
                      No schedule available
                    </span>
                  )}
                </div>
              </div>

              <button
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                style={{ backgroundColor: color, color: onBrand }}
                onClick={() =>
                  navigate(`/clinic-portal/${linkId}/clinician/${clinicians[0].id}`)
                }
              >
                View Profile & Book
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clinicians.map((clinician: any) => (
              <div
                key={clinician.id}
                className="group bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() =>
                  navigate(`/clinic-portal/${linkId}/clinician/${clinician.id}`)
                }
              >
                <div
                  className="h-2"
                  style={{ background: brandGradient(color) }}
                />
                <div className="p-7">
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="relative h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm shrink-0"
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
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">
                        {clinician.name}
                      </h3>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: textColor }}
                      >
                        {clinician.role}
                      </p>
                    </div>
                  </div>

                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-4 border"
                    style={{
                      backgroundColor: brandBg(color, 0.1),
                      color: textColor,
                      borderColor: brandBg(color, 0.2),
                    }}
                  >
                    <Star className="h-3 w-3" />
                    {clinician.specialty}
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">
                    {clinician.bio}
                  </p>

                  <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Available Days
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {clinician.availability.length > 0 ? (
                        clinician.availability.map((a: any) => (
                          <span
                            key={a.day}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm"
                          >
                            {a.day.slice(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          No schedule available
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="w-full py-3 text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:opacity-90"
                    style={{ background: brandGradient(color), color: onBrand }}
                  >
                    View Profile & Book
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs">
            © 2026 {clinicName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function roleToLabel(role?: string) {
  const normalized = (role || "").toLowerCase();
  if (normalized === "superadmin") return "Lead Clinician";
  if (normalized === "admin") return "Admin";
  if (normalized === "clinician") return "Clinician";
  return "Clinician";
}
