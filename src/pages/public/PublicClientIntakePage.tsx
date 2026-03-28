import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Check, Mail, MapPin, Phone, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { brandBg, brandGradient } from '../../lib/branding';
import { useGetPublicClientByTokenQuery, useUpdatePublicClientByTokenMutation } from '../../redux/api/clientsApi';

type FormState = Record<string, string | string[] | boolean>;

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/5';
const textAreaClassName = `${inputClassName} min-h-[120px] resize-y`;
const sectionClassName = 'rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-8';

const initialForm: FormState = {
  firstName: '', lastName: '', dateOfBirth: '', gender: '', genderSelfDescribe: '',
  addressStreet: '', addressCity: '', addressPostcode: '', mobileCountryCode: '+44', mobileNumber: '', email: '',
  livingSituation: [], livingSituationOther: '', mentalHealthServices: [], mentalHealthServicesOther: '', mentalHealthServicesDetails: '',
  takesMedication: '', medicationDetails: '', presentingProblem: '', safetyRisk: '', safetyDetails: '',
  gpName: '', surgeryName: '', surgeryStreet: '', surgeryCity: '', surgeryPostcode: '',
  paymentMethod: '', paymentOtherDetails: '', insurerName: '', authorizationCode: '',
  hearAboutUs: [], hearAboutUsDetails: '',
  declarationAccepted: false, declarationFullName: '', declarationSignature: '', declarationDate: '', guardianName: '', guardianSignature: '',
};

const livingSituationOptions = ['Living alone', 'Living with partner', 'Caring for children under 5', 'Caring for children over 5', 'Living with parents / guardian', 'Living with other relatives / friends', 'Full-time carer', 'Living in shared accommodation', 'Living in temporary accommodation', 'Living in institution / hospital', 'Other'];
const mentalHealthServiceOptions = ['GP', 'Psychologist', 'Psychiatrist', 'Counsellor / Therapist', 'Hospital inpatient', 'Other (e.g. religious / community)'];
const hearAboutUsOptions = ['Google / online search', 'Psychology Today', 'Counselling Directory', 'Word of mouth / recommendation', 'Social media', 'GP referral', 'Other website'];

export function PublicClientIntakePage() {
  const { branding } = useData();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const brandColor = branding.color || '#779362';
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const publicToken = searchParams.get('publicToken') || '';
  const { data: publicClientResponse, isLoading, isError } = useGetPublicClientByTokenQuery(publicToken, {
    skip: !publicToken,
  });
  const [updatePublicClientByToken, { isLoading: isSubmitting }] = useUpdatePublicClientByTokenMutation();
  const clientData = publicClientResponse?.response?.data;
  const clientName = [clientData?.firstName, clientData?.lastName].filter(Boolean).join(' ').trim();

  useEffect(() => {
    if (!clientData) return;
    setForm((prev) => ({
      ...prev,
      firstName: clientData.firstName || '',
      lastName: clientData.lastName || '',
      email: clientData.email || '',
      dateOfBirth: clientData.dateOfBirth || '',
      gender: clientData.gender || '',
      genderSelfDescribe: clientData.genderSelfDescribe || '',
      mobileCountryCode: clientData.mobileCountryCode || '+44',
      mobileNumber: clientData.mobileNumber || '',
      addressStreet: clientData.addressStreet || '',
      addressCity: clientData.addressCity || '',
      addressPostcode: clientData.addressPostcode || '',
      livingSituation: clientData.livingSituation || [],
      livingSituationOther: clientData.livingSituationOther || '',
      mentalHealthServices: clientData.mentalHealthServices || [],
      mentalHealthServicesOther: clientData.mentalHealthServicesOther || '',
      mentalHealthServicesDetails: clientData.mentalHealthServicesDetails || '',
      takesMedication: clientData.takesMedication || '',
      medicationDetails: clientData.medicationDetails || '',
      presentingProblem: clientData.presentingProblem || '',
      safetyRisk: clientData.safetyRisk || '',
      safetyDetails: clientData.safetyDetails || '',
      gpName: clientData.gpName || '',
      surgeryName: clientData.surgeryName || '',
      surgeryStreet: clientData.surgeryStreet || '',
      surgeryCity: clientData.surgeryCity || '',
      surgeryPostcode: clientData.surgeryPostcode || '',
      paymentMethod: clientData.paymentMethod || '',
      paymentOtherDetails: clientData.paymentOtherDetails || '',
      insurerName: clientData.insurerName || '',
      authorizationCode: clientData.authorizationCode || '',
      hearAboutUs: clientData.hearAboutUs || [],
      hearAboutUsDetails: clientData.hearAboutUsDetails || '',
      declarationAccepted: Boolean(clientData.declarationAccepted),
      declarationFullName: clientData.declarationFullName || '',
      declarationSignature: clientData.declarationSignature || '',
      declarationDate: clientData.declarationDate || '',
      guardianName: clientData.guardianName || '',
      guardianSignature: clientData.guardianSignature || '',
    }));
  }, [clientData]);

  const setField = (key: string, value: string | string[] | boolean) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleInList = (key: string, value: string) => {
    const current = (form[key] as string[]) || [];
    setField(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!String(form.firstName).trim()) nextErrors.firstName = 'First name is required.';
    if (!String(form.lastName).trim()) nextErrors.lastName = 'Last name is required.';
    if (!String(form.dateOfBirth)) nextErrors.dateOfBirth = 'Date of birth is required.';
    if (!String(form.gender)) nextErrors.gender = 'Please select a gender option.';
    if (form.gender === 'Prefer to self-describe' && !String(form.genderSelfDescribe).trim()) nextErrors.genderSelfDescribe = 'Please specify your self-described gender.';
    if (!String(form.addressStreet).trim()) nextErrors.addressStreet = 'Street address is required.';
    if (!String(form.addressCity).trim()) nextErrors.addressCity = 'City / Town is required.';
    if (!String(form.addressPostcode).trim()) nextErrors.addressPostcode = 'Postcode is required.';
    if (!String(form.mobileNumber).trim()) nextErrors.mobileNumber = 'Mobile / Contact Number is required.';
    if (!String(form.email).trim()) nextErrors.email = 'Email address is required.';
    if ((form.livingSituation as string[]).includes('Other') && !String(form.livingSituationOther).trim()) nextErrors.livingSituationOther = 'Please describe your living situation.';
    if ((form.mentalHealthServices as string[]).includes('Other (e.g. religious / community)') && !String(form.mentalHealthServicesOther).trim()) nextErrors.mentalHealthServicesOther = 'Please specify the other service used.';
    if (!String(form.takesMedication)) nextErrors.takesMedication = 'Please tell us whether you take any medication.';
    if (form.takesMedication === 'Yes' && !String(form.medicationDetails).trim()) nextErrors.medicationDetails = 'Please list your current medications and dosages.';
    if (!String(form.presentingProblem).trim()) nextErrors.presentingProblem = 'Presenting problem is required.';
    if (!String(form.safetyRisk)) nextErrors.safetyRisk = 'Please answer the safety question.';
    if (form.safetyRisk === 'Yes' && !String(form.safetyDetails).trim()) nextErrors.safetyDetails = 'Please describe the current safety concern.';
    if (!String(form.gpName).trim()) nextErrors.gpName = 'GP Name is required.';
    if (!String(form.surgeryName).trim()) nextErrors.surgeryName = 'Surgery Name is required.';
    if (!String(form.surgeryStreet).trim()) nextErrors.surgeryStreet = 'Surgery street address is required.';
    if (!String(form.surgeryCity).trim()) nextErrors.surgeryCity = 'Surgery city / town is required.';
    if (!String(form.surgeryPostcode).trim()) nextErrors.surgeryPostcode = 'Surgery postcode is required.';
    if (!String(form.paymentMethod)) nextErrors.paymentMethod = 'Please select a payment method.';
    if (form.paymentMethod === 'Other' && !String(form.paymentOtherDetails).trim()) nextErrors.paymentOtherDetails = 'Please describe the payment method.';
    if ((form.paymentMethod === 'Health insurance' || form.paymentMethod === 'Employee Assistance Programme (EAP)') && !String(form.insurerName).trim()) nextErrors.insurerName = 'Insurer / provider name is required.';
    if ((form.paymentMethod === 'Health insurance' || form.paymentMethod === 'Employee Assistance Programme (EAP)') && !String(form.authorizationCode).trim()) nextErrors.authorizationCode = 'Authorisation / activation code is required.';
    if (!form.declarationAccepted) nextErrors.declarationAccepted = 'You must confirm the declaration before submitting.';
    if (!String(form.declarationFullName).trim()) nextErrors.declarationFullName = 'Printed full name is required.';
    if (!String(form.declarationSignature).trim()) nextErrors.declarationSignature = 'Signature is required.';
    if (!String(form.declarationDate)) nextErrors.declarationDate = 'Declaration date is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!publicToken) return;

    updatePublicClientByToken({
      publicToken,
      ...form,
      guardianName: String(form.guardianName || '').trim() || null,
      guardianSignature: String(form.guardianSignature || '').trim() || null,
    })
      .unwrap()
      .then(() => {
        setIsSubmitted(true);
      })
      .catch((error: any) => {
        alert(error?.data?.message || 'Unable to submit the intake form. Please try again.');
      });
  };

  if (!publicToken) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Missing public intake token.</div>;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading intake form...</div>;
  }

  if (isError || !clientData) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Unable to load the client intake form.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black text-white shadow-md" style={{ background: brandGradient(brandColor) }}>I</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">InDesk Partner Practice</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">Public Client Intake Form</p>
            </div>
          </div>
          <a href="tel:+44" className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:flex" style={{ background: brandColor }}>
            <Phone className="h-3.5 w-3.5" />
            Contact
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: brandGradient(brandColor) }} />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/85">
            <Shield className="h-3.5 w-3.5" />
            Complete Before Your First Appointment
          </div>
          <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">New Client Information Form</h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg font-medium leading-relaxed text-white/85">
            Please complete all sections as fully as possible before your first appointment. Fields marked with * are required.
          </p>
          {clientName && (
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              Completing form for {clientName}
            </div>
          )}
          <a href="#intake-form" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold shadow-xl transition hover:bg-white/90" style={{ color: brandColor }}>
            Start Form
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Phone, label: 'Phone', value: '+44' },
            { icon: Mail, label: 'Email', value: 'support@myindesk.com' },
            { icon: MapPin, label: 'Address', value: 'Clinic address available on request' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/60">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: brandBg(brandColor, 0.1), color: brandColor }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                <p className="truncate text-sm font-semibold text-slate-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <main id="intake-form" className="mx-auto max-w-5xl px-4 pb-20 pt-14 sm:px-6">
        {isSubmitted ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-xl shadow-emerald-100/60">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Form Submitted</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Your intake form has been completed in this browser. The current implementation stores the submission locally on this device so the public frontend flow works end to end.
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={() => { setErrors({}); setIsSubmitted(false); }}>Review Submission</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderSections(form, errors, setField, toggleInList)}
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 sm:flex-row sm:items-center">
              {/* <p className="max-w-2xl text-sm text-slate-500">
                This public form reproduces the intake fields from the provided PDF template and can be filled by any client through a shareable public link.
              </p> */}
              <Button type="submit" className="min-w-[180px]" isLoading={isSubmitting}>Submit Form</Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800">{label}</label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function CheckboxGrid({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
          {option}
        </label>
      ))}
    </div>
  );
}

function renderSections(
  form: FormState,
  errors: Record<string, string>,
  setField: (key: string, value: string | string[] | boolean) => void,
  toggleInList: (key: string, value: string) => void,
) {
  return (
    <>
      <section className={sectionClassName}>
        <SectionHeading section="Section 1" title="Personal Details" />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="First Name *" error={errors.firstName}><input className={inputClassName} value={String(form.firstName)} onChange={(e) => setField('firstName', e.target.value)} /></Field>
          <Field label="Last Name *" error={errors.lastName}><input className={inputClassName} value={String(form.lastName)} onChange={(e) => setField('lastName', e.target.value)} /></Field>
          <Field label="Date of Birth *" error={errors.dateOfBirth}><input type="date" className={inputClassName} value={String(form.dateOfBirth)} onChange={(e) => setField('dateOfBirth', e.target.value)} /></Field>
          <Field label="Gender *" error={errors.gender}>
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {['Female', 'Male', 'Non-binary', 'Prefer to self-describe', 'Prefer not to say'].map((option) => (
                <label key={option} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input type="radio" name="gender" checked={form.gender === option} onChange={() => setField('gender', option)} />
                  {option}
                </label>
              ))}
              {form.gender === 'Prefer to self-describe' && (
                <div>
                  <input className={inputClassName} placeholder="If self-describing, please specify" value={String(form.genderSelfDescribe)} onChange={(e) => setField('genderSelfDescribe', e.target.value)} />
                  {errors.genderSelfDescribe && <p className="mt-2 text-xs font-medium text-red-600">{errors.genderSelfDescribe}</p>}
                </div>
              )}
            </div>
          </Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 2" title="Contact Details" />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Street Address *" error={errors.addressStreet}><input className={inputClassName} value={String(form.addressStreet)} onChange={(e) => setField('addressStreet', e.target.value)} /></Field>
          <Field label="City / Town *" error={errors.addressCity}><input className={inputClassName} value={String(form.addressCity)} onChange={(e) => setField('addressCity', e.target.value)} /></Field>
          <Field label="Postcode *" error={errors.addressPostcode}><input className={inputClassName} value={String(form.addressPostcode)} onChange={(e) => setField('addressPostcode', e.target.value)} /></Field>
          <Field label="Mobile / Contact Number *"  error={errors.mobileNumber}>
            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              <input className={inputClassName} value={String(form.mobileCountryCode)} onChange={(e) => setField('mobileCountryCode', e.target.value)} placeholder="+44" />
              <input className={inputClassName} value={String(form.mobileNumber)} onChange={(e) => setField('mobileNumber', e.target.value)} placeholder="Mobile number" />
            </div>
          </Field>
          <Field label="Email Address *" error={errors.email}><input type="email" className={inputClassName} value={String(form.email)} onChange={(e) => setField('email', e.target.value)} placeholder="email@example.com" /></Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 3" title="Living Situation" description="Please tick all that apply." />
        <CheckboxGrid options={livingSituationOptions} selected={(form.livingSituation as string[]) || []} onToggle={(value) => toggleInList('livingSituation', value)} />
        <div className="mt-5">
          <Field label="If 'Other', please describe" error={errors.livingSituationOther}><input className={inputClassName} value={String(form.livingSituationOther)} onChange={(e) => setField('livingSituationOther', e.target.value)} /></Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 4" title="Current / Previous Use of Mental Health Services" description="Please tick any services you have used previously or are currently using." />
        <CheckboxGrid options={mentalHealthServiceOptions} selected={(form.mentalHealthServices as string[]) || []} onToggle={(value) => toggleInList('mentalHealthServices', value)} />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Other service used" error={errors.mentalHealthServicesOther}><input className={inputClassName} value={String(form.mentalHealthServicesOther)} onChange={(e) => setField('mentalHealthServicesOther', e.target.value)} /></Field>
          <Field label="Additional details (optional)"><textarea className={textAreaClassName} value={String(form.mentalHealthServicesDetails)} onChange={(e) => setField('mentalHealthServicesDetails', e.target.value)} /></Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 5" title="Medication" />
        <Field label="Do you currently take any medication? *" error={errors.takesMedication}>
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            {['Yes', 'No'].map((option) => (
              <label key={option} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input type="radio" name="takesMedication" checked={form.takesMedication === option} onChange={() => setField('takesMedication', option)} />
                {option}
              </label>
            ))}
          </div>
        </Field>
        <div className="mt-5">
          <Field label="If yes, please list your current medications and dosages" error={errors.medicationDetails}><textarea className={textAreaClassName} value={String(form.medicationDetails)} onChange={(e) => setField('medicationDetails', e.target.value)} /></Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 6" title="Presenting Problem" />
        <Field label="Please provide a brief description of the difficulties you would like help with *" error={errors.presentingProblem}>
          <textarea className={textAreaClassName} value={String(form.presentingProblem)} onChange={(e) => setField('presentingProblem', e.target.value)} />
        </Field>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 7" title="Safety" description="Your safety is our priority. Your answer will be treated with care and discussed sensitively at your first appointment." />
        <Field label="Do you have any current thoughts of suicide, harming yourself, or harming someone else? *" error={errors.safetyRisk}>
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            {['Yes', 'No'].map((option) => (
              <label key={option} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input type="radio" name="safetyRisk" checked={form.safetyRisk === option} onChange={() => setField('safetyRisk', option)} />
                {option}
              </label>
            ))}
          </div>
        </Field>
        <div className="mt-5">
          <Field label="If yes, please describe these thoughts below" error={errors.safetyDetails}><textarea className={textAreaClassName} value={String(form.safetyDetails)} onChange={(e) => setField('safetyDetails', e.target.value)} /></Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 8" title="GP Details" />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="GP Name *" error={errors.gpName}><input className={inputClassName} value={String(form.gpName)} onChange={(e) => setField('gpName', e.target.value)} /></Field>
          <Field label="Surgery Name *" error={errors.surgeryName}><input className={inputClassName} value={String(form.surgeryName)} onChange={(e) => setField('surgeryName', e.target.value)} /></Field>
          <Field label="Surgery Street Address *" error={errors.surgeryStreet}><input className={inputClassName} value={String(form.surgeryStreet)} onChange={(e) => setField('surgeryStreet', e.target.value)} /></Field>
          <Field label="City / Town *" error={errors.surgeryCity}><input className={inputClassName} value={String(form.surgeryCity)} onChange={(e) => setField('surgeryCity', e.target.value)} /></Field>
          <Field label="Postcode *" error={errors.surgeryPostcode}><input className={inputClassName} value={String(form.surgeryPostcode)} onChange={(e) => setField('surgeryPostcode', e.target.value)} /></Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 9" title="Payment" />
        <Field label="How will you be funding your sessions? *" error={errors.paymentMethod}>
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            {['Self-paying', 'Health insurance', 'Employee Assistance Programme (EAP)', 'Other'].map((option) => (
              <label key={option} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input type="radio" name="paymentMethod" checked={form.paymentMethod === option} onChange={() => setField('paymentMethod', option)} />
                {option}
              </label>
            ))}
          </div>
        </Field>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="If 'Other', please describe" error={errors.paymentOtherDetails}><input className={inputClassName} value={String(form.paymentOtherDetails)} onChange={(e) => setField('paymentOtherDetails', e.target.value)} /></Field>
          <Field label="Insurer / provider name" hint="If using insurance or EAP, please provide your insurer name." error={errors.insurerName}><input className={inputClassName} value={String(form.insurerName)} onChange={(e) => setField('insurerName', e.target.value)} /></Field>
          <Field label="Authorisation / activation code" hint="It is your responsibility to obtain authorisation from your insurer before sessions begin." error={errors.authorizationCode}><input className={inputClassName} value={String(form.authorizationCode)} onChange={(e) => setField('authorizationCode', e.target.value)} /></Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 10" title="How Did You Hear About Us?" />
        <CheckboxGrid options={hearAboutUsOptions} selected={(form.hearAboutUs as string[]) || []} onToggle={(value) => toggleInList('hearAboutUs', value)} />
        <div className="mt-5">
          <Field label="If 'Other' or you'd like to give more detail"><textarea className={textAreaClassName} value={String(form.hearAboutUsDetails)} onChange={(e) => setField('hearAboutUsDetails', e.target.value)} /></Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeading section="Section 11" title="Declaration" />
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <input type="checkbox" checked={Boolean(form.declarationAccepted)} onChange={(e) => setField('declarationAccepted', e.target.checked)} className="mt-1" />
          <span>I confirm that the information provided above is accurate to the best of my knowledge. I understand that this information will be stored securely in accordance with the Privacy Statement provided separately.</span>
        </label>
        {errors.declarationAccepted && <p className="mt-2 text-xs font-medium text-red-600">{errors.declarationAccepted}</p>}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Full name (print)" error={errors.declarationFullName}><input className={inputClassName} value={String(form.declarationFullName)} onChange={(e) => setField('declarationFullName', e.target.value)} /></Field>
          <Field label="Signature" error={errors.declarationSignature}><input className={inputClassName} value={String(form.declarationSignature)} onChange={(e) => setField('declarationSignature', e.target.value)} /></Field>
          <Field label="Date" error={errors.declarationDate}><input type="date" className={inputClassName} value={String(form.declarationDate)} onChange={(e) => setField('declarationDate', e.target.value)} /></Field>
          <Field label="Parent / Guardian name (if client is under 18)"><input className={inputClassName} value={String(form.guardianName)} onChange={(e) => setField('guardianName', e.target.value)} /></Field>
          <Field label="Parent / Guardian signature (if applicable)"><input className={inputClassName} value={String(form.guardianSignature)} onChange={(e) => setField('guardianSignature', e.target.value)} /></Field>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ section, title, description }: { section: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{section}</p>
      <h2 className="mt-2 text-2xl font-black text-slate-900">{title}</h2>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
