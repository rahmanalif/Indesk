import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import timezones from 'timezones-list';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Video,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PhoneNumberInput, isValidPhoneNumber, parsePhoneNumber } from '../components/ui/PhoneNumberInput';
import { AvailabilityScheduleEditor } from '../components/clinicians/AvailabilityScheduleEditor';
import {
  buildAvailabilitySchedulePayload,
  normalizeAvailabilitySchedule,
  type AvailabilityDaySchedule,
} from '../lib/clinicianAvailability';
import { getFriendlyErrorMessage } from '../lib/utils';
import {
  useCompleteOnboardingMutation,
  useGetOnboardingStatusQuery,
  useSaveOnboardingStepMutation,
} from '../redux/api/onboardingApi';
import { useLazyGetIntegrationOAuthUrlQuery } from '../redux/api/integrationApi';
import { useLazyGetSelfProfileQuery } from '../redux/api/authApi';
import { updateUser } from '../redux/slices/authSlice';
import { useAuth } from '../hooks/useAuth';
import { getClinicOnboardingState } from '../lib/onboarding';
import type { AppDispatch } from '../store';

const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const STEPS = [
  {
    id: 1,
    title: 'Clinic details',
    description: 'Confirm your practice profile so clients can find you.',
    illustration: '/images/logindemo4.png',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Availability',
    description: 'Set the days and hours you are bookable.',
    illustration: '/images/logindemo3.png',
    icon: CalendarDays,
  },
  {
    id: 3,
    title: 'Telehealth',
    description: 'Connect Zoom or Google Meet for online sessions.',
    illustration: '/images/logindemo2.png',
    icon: Video,
  },
  {
    id: 4,
    title: 'Payments',
    description: 'Set up Stripe Connect to receive patient payments.',
    illustration: '/images/logindemo4.png',
    icon: CreditCard,
  },
] as const;

type StepId = 1 | 2 | 3 | 4;

export function OnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const { isOnboarded: localOnboarded, hasClinic } = getClinicOnboardingState(user);

  const {
    data: statusResponse,
    isLoading: isStatusLoading,
    isFetching: isStatusFetching,
    error: statusError,
    refetch,
  } = useGetOnboardingStatusQuery(undefined, {
    skip: !isAuthenticated || !hasClinic,
  });

  const [saveStep, { isLoading: isSaving }] = useSaveOnboardingStepMutation();
  const [completeOnboarding, { isLoading: isCompleting }] = useCompleteOnboardingMutation();
  const [getOAuthUrl, { isFetching: isOAuthLoading }] = useLazyGetIntegrationOAuthUrlQuery();
  const [fetchSelfProfile] = useLazyGetSelfProfileQuery();

  const markLocalOnboarded = async () => {
    try {
      const profileResponse = await fetchSelfProfile().unwrap();
      const profile = profileResponse?.response?.data;
      if (profile) {
        dispatch(updateUser(profile as any));
        return;
      }
    } catch {
      // Fall through to optimistic local patch
    }

    if (!user) return;

    const patchClinic = (clinic: any) =>
      clinic
        ? { ...clinic, isOnboarded: true, onboardingStep: 5 }
        : clinic;

    dispatch(
      updateUser({
        clinicMemberships: user.clinicMemberships?.map((membership) => ({
          ...membership,
          clinic: patchClinic(membership.clinic),
        })),
        ownedClinics: user.ownedClinics?.map((clinic) => patchClinic(clinic)),
      } as any),
    );
  };

  const status = statusResponse?.response?.data;
  const [step, setStep] = useState<StepId>(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const [clinicForm, setClinicForm] = useState({
    name: '',
    url: '',
    email: '',
    phone: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
  });
  const [clinicErrors, setClinicErrors] = useState<Record<string, string>>({});
  const [availabilitySchedule, setAvailabilitySchedule] = useState<AvailabilityDaySchedule[]>([
    { day: 'monday', startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' },
    { day: 'tuesday', startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' },
    { day: 'wednesday', startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' },
    { day: 'thursday', startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' },
    { day: 'friday', startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' },
  ]);

  const timezoneOptions = useMemo(
    () =>
      timezones.map((tz) => ({
        value: tz.tzCode,
        label: tz.label,
      })),
    [],
  );

  const isBusy = isSaving || isCompleting || isOAuthLoading || isStatusFetching;
  const currentStepMeta = STEPS.find((item) => item.id === step) || STEPS[0];
  const StepIcon = currentStepMeta.icon;
  const isFullyOnboarded = status?.isOnboarded === true || (localOnboarded && !statusError && !isStatusLoading);

  useEffect(() => {
    const oauthStatus = searchParams.get('status');
    const oauthMessage = searchParams.get('message');
    const oauthType = searchParams.get('type');
    const stepParam = Number(searchParams.get('step'));

    if (stepParam >= 1 && stepParam <= 4) {
      setStep(stepParam as StepId);
    }

    if (oauthStatus === 'success') {
      setSuccess(oauthMessage || `${oauthType || 'Integration'} connected successfully.`);
      setError('');
      refetch();
    } else if (oauthStatus === 'error') {
      setError(oauthMessage || 'Failed to connect integration.');
      setSuccess('');
    }

    if (oauthStatus || searchParams.has('success') || searchParams.has('error')) {
      const nextParams = new URLSearchParams(searchParams);
      ['status', 'success', 'message', 'type', 'error'].forEach((key) => nextParams.delete(key));
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refetch]);

  useEffect(() => {
    if (!status || hydrated) return;

    const phoneValue = status.clinic.phoneNumber
      ? `${status.clinic.countryCode || ''}${status.clinic.phoneNumber}`
      : '';

    setClinicForm({
      name: status.clinic.name || '',
      url: status.clinic.url || '',
      email: status.clinic.email || '',
      phone: phoneValue,
      timezone: status.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
    });

    const normalized = normalizeAvailabilitySchedule(status.availabilitySchedule);
    if (normalized.length > 0) {
      setAvailabilitySchedule(normalized);
    }

    if (!searchParams.get('step')) {
      const preferred = Math.min(Math.max(status.onboardingStep || 1, 1), 4) as StepId;
      setStep(preferred);
    }
    setHydrated(true);
  }, [status, hydrated, searchParams]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasClinic) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isFullyOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isStatusLoading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (statusError && !status) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="text-sm text-red-600 text-center">
          {getFriendlyErrorMessage(statusError, 'Unable to load onboarding status.')}
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  const integrations = status?.integrations || [];
  const isZoomConnected = integrations.some((item) => item.type === 'zoom' && item.isConnected);
  const isMeetConnected = integrations.some(
    (item) => item.type === 'google_meet' && item.isConnected,
  );
  const isStripeConnected =
    integrations.some((item) => item.type === 'stripe' && item.isConnected) ||
    Boolean(status?.clinic.stripeConnectAccountId);

  const validateClinic = () => {
    const nextErrors: Record<string, string> = {};
    if (!clinicForm.name.trim()) nextErrors.name = 'Clinic name is required.';
    if (!clinicForm.email.trim()) nextErrors.email = 'Support email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clinicForm.email.trim())) {
      nextErrors.email = 'Enter a valid email.';
    }
    if (clinicForm.phone.trim() && !isValidPhoneNumber(clinicForm.phone)) {
      nextErrors.phone = 'Enter a valid phone number.';
    }
    if (!clinicForm.timezone) nextErrors.timezone = 'Timezone is required.';
    setClinicErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConnect = async (type: 'zoom' | 'google_meet' | 'stripe') => {
    setError('');
    setSuccess('');
    try {
      const returnTo = `/onboarding?step=${step}`;
      const response = await getOAuthUrl({ type, returnTo }).unwrap();
      const oauthUrl = response.response?.data?.oauthUrl;
      if (!oauthUrl) {
        throw new Error('OAuth URL missing');
      }
      window.location.href = oauthUrl;
    } catch (err) {
      setError(getFriendlyErrorMessage(err, `Failed to start ${type} connection.`));
    }
  };

  const goNextLocal = (next: StepId) => {
    setStep(next);
    setError('');
    setSuccess('');
  };

  const handleStepSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!status?.canEdit) return;

    setError('');
    setSuccess('');

    try {
      if (step === 1) {
        if (!validateClinic()) return;
        const parsed = clinicForm.phone.trim()
          ? parsePhoneNumber(clinicForm.phone.trim())
          : undefined;
        await saveStep({
          step: 1,
          data: {
            name: clinicForm.name.trim(),
            url: clinicForm.url.trim() || undefined,
            email: clinicForm.email.trim(),
            phoneNumber: parsed?.nationalNumber,
            countryCode: parsed ? `+${parsed.countryCallingCode}` : undefined,
            timezone: clinicForm.timezone,
          },
        }).unwrap();
        goNextLocal(2);
        return;
      }

      if (step === 2) {
        if (availabilitySchedule.length === 0) {
          setError('Select at least one working day.');
          return;
        }
        await saveStep({
          step: 2,
          data: {
            availabilitySchedule: buildAvailabilitySchedulePayload(availabilitySchedule),
          },
        }).unwrap();
        goNextLocal(3);
        return;
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Unable to save this step. Please try again.'));
    }
  };

  const handleSkipIntegrations = async () => {
    if (!status?.canEdit) return;
    setError('');
    try {
      await saveStep({ step: 3, data: { skip: true } }).unwrap();
      goNextLocal(4);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Unable to skip this step.'));
    }
  };

  const handleFinish = async (skipStripe: boolean) => {
    if (!status?.canEdit) return;
    setError('');
    try {
      await saveStep({ step: 4, data: { skip: skipStripe } }).unwrap();
      await completeOnboarding().unwrap();
      await markLocalOnboarded();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Unable to complete onboarding.'));
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      <div className="w-full lg:w-[54%] flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/images/inkind logo-04.png" alt="InDesk" className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
              Step {step} of {STEPS.length}
            </p>
            <div className="flex gap-2 mb-6">
              {STEPS.map((item) => (
                <div
                  key={item.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    item.id <= step ? 'bg-primary' : 'bg-primary/15'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-2xl bg-secondary/60 p-2.5 text-primary">
                <StepIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-3xl text-foreground tracking-tight">
                  {currentStepMeta.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentStepMeta.description}
                </p>
              </div>
            </div>
          </div>

          {!status?.canEdit && (
            <div className="mb-6 rounded-2xl border border-primary/15 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
              Your clinic admin still needs to finish setup. You can sign out and come back later.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleStepSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <Input
                  label="Clinic name"
                  value={clinicForm.name}
                  onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                  error={clinicErrors.name}
                  disabled={!status?.canEdit || isBusy}
                  required
                />
                <Input
                  label="Public URL / slug"
                  placeholder="your-clinic"
                  value={clinicForm.url}
                  onChange={(e) => setClinicForm({ ...clinicForm, url: e.target.value })}
                  disabled={!status?.canEdit || isBusy}
                />
                <Input
                  label="Support email"
                  type="email"
                  value={clinicForm.email}
                  onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                  error={clinicErrors.email}
                  disabled={!status?.canEdit || isBusy}
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">
                    Phone number
                  </label>
                  <PhoneNumberInput
                    value={clinicForm.phone}
                    onChange={(phone) => {
                      setClinicForm({ ...clinicForm, phone });
                      if (clinicErrors.phone) {
                        setClinicErrors((prev) => ({ ...prev, phone: '' }));
                      }
                    }}
                    error={clinicErrors.phone}
                  />
                </div>
                <div className="space-y-1.5">
                  <Select
                    label="Timezone"
                    options={timezoneOptions}
                    value={clinicForm.timezone}
                    onChange={(e) => setClinicForm({ ...clinicForm, timezone: e.target.value })}
                    disabled={!status?.canEdit || isBusy}
                  />
                  {clinicErrors.timezone && (
                    <p className="text-red-500 text-xs ml-1">{clinicErrors.timezone}</p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <AvailabilityScheduleEditor
                days={WEEK_DAYS}
                schedule={availabilitySchedule}
                onChange={setAvailabilitySchedule}
              />
            )}

            {step === 3 && (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={!status?.canEdit || isBusy}
                  onClick={() => handleConnect('zoom')}
                  className="w-full flex items-center justify-between rounded-2xl border border-primary/15 bg-secondary/30 px-5 py-4 text-left hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">Connect Zoom</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isZoomConnected ? 'Connected' : 'Optional — generate Zoom meeting links'}
                    </p>
                  </div>
                  {isZoomConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={!status?.canEdit || isBusy}
                  onClick={() => handleConnect('google_meet')}
                  className="w-full flex items-center justify-between rounded-2xl border border-primary/15 bg-secondary/30 px-5 py-4 text-left hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">Connect Google Meet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isMeetConnected ? 'Connected' : 'Optional — generate Meet links'}
                    </p>
                  </div>
                  {isMeetConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={!status?.canEdit || isBusy}
                  onClick={() => handleConnect('stripe')}
                  className="w-full flex items-center justify-between rounded-2xl border border-primary/15 bg-secondary/30 px-5 py-4 text-left hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">Set up Stripe Connect</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isStripeConnected
                        ? 'Connected — you can receive patient payments'
                        : 'Optional — required later for paid appointments'}
                    </p>
                  </div>
                  {isStripeConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}

            {status?.canEdit && (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:w-auto"
                    disabled={isBusy}
                    onClick={() => goNextLocal((step - 1) as StepId)}
                  >
                    Back
                  </Button>
                )}

                {step === 3 ? (
                  <Button type="button" className="flex-1" disabled={isBusy} onClick={handleSkipIntegrations}>
                    {isZoomConnected || isMeetConnected ? 'Continue' : 'Skip for now'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : step === 4 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={isBusy}
                      onClick={() => handleFinish(true)}
                    >
                      Skip & finish
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      disabled={isBusy}
                      onClick={() => handleFinish(!isStripeConnected)}
                    >
                      {isBusy ? 'Finishing...' : 'Finish setup'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button type="submit" className="flex-1" disabled={isBusy}>
                    {isBusy ? 'Saving...' : 'Continue'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="hidden lg:block lg:w-[46%] h-screen sticky top-0 overflow-hidden bg-[#E8EAE3]">
        <div className="h-full w-full relative">
          <img
            key={currentStepMeta.illustration}
            src={currentStepMeta.illustration}
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <p className="font-serif text-2xl leading-snug">{currentStepMeta.title}</p>
            <p className="mt-2 text-sm text-white/80 max-w-sm">{currentStepMeta.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
