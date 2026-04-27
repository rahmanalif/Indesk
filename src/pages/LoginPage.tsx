import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Eye, EyeOff, ArrowRight, AlertCircle, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  COUNTRY_PHONE_OPTIONS,
  getCountryPhoneError,
  getCountryPhoneOption,
  normalizePhoneDigits,
} from '../lib/countryPhoneOptions';
import {
  useCancelPlanOnboardingMutation,
  useCreatePlanCheckoutMutation,
  useGetAvailablePlansQuery,
  useInitiatePlanOnboardingMutation,
  useVerifyPlanOnboardingEmailMutation,
} from '../redux/api/clientsApi';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading, error: authError, clearError } = useAuth();
  const {
    data: plansResponse,
    isLoading: isPlansLoading,
    isFetching: isPlansFetching,
    error: plansError,
  } = useGetAvailablePlansQuery();
  const [initiatePlanOnboarding, { isLoading: isInitiating }] = useInitiatePlanOnboardingMutation();
  const [verifyPlanOnboardingEmail, { isLoading: isVerifyingEmail }] = useVerifyPlanOnboardingEmailMutation();
  const [createPlanCheckout, { isLoading: isCreatingCheckout }] = useCreatePlanCheckoutMutation();
  const [cancelPlanOnboarding, { isLoading: isCancellingOnboarding }] = useCancelPlanOnboardingMutation();
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const searchParams = new URLSearchParams(location.search);
  const isSignupMode = searchParams.get('mode') === 'signup';
  const requestedPlanId = searchParams.get('planId');
  const shouldFocusPlanField = searchParams.get('focus') === 'plan';
  const availablePlans = Array.isArray(plansResponse)
    ? plansResponse
    : Array.isArray(plansResponse?.response?.data)
      ? plansResponse.response.data
      : Array.isArray(plansResponse?.data)
        ? plansResponse.data
        : [];
  const planOptions = availablePlans.map((plan) => ({
    value: plan.id,
    label: `${plan.name} - £${Number(plan.price).toFixed(Number.isInteger(plan.price) ? 0 : 2)}/mo`,
  }));

  const [showSignupPanel, setShowSignupPanel] = useState(isSignupMode);
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const planSelectRef = useRef<HTMLSelectElement | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    clinicName: '',
    clinicEmail: '',
    countryCode: '+44',
    clinicPhone: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    addressCountry: '',
    planId: '',
    startTrial: true,
    acceptedTerms: false,
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  const [signupErrors, setSignupErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    clinicName: '',
    clinicEmail: '',
    countryCode: '',
    clinicPhone: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    addressCountry: '',
    planId: '',
    code: '',
    acceptedTerms: '',
  });
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupError, setSignupError] = useState('');
  const [pendingOnboardingId, setPendingOnboardingId] = useState('');
  const selectedPlan = availablePlans.find((plan) => plan.id === signupData.planId);
  const selectedCountryPhone = getCountryPhoneOption(signupData.countryCode);
  const isSignupLoading = isInitiating || isVerifyingEmail || isCreatingCheckout || isCancellingOnboarding;
  const isLoading = authLoading || isSignupLoading;
  const isPlanSelectDisabled = isLoading || ((isPlansLoading || isPlansFetching) && planOptions.length === 0);
  const planLoadErrorMessage = !planOptions.length && plansError
    ? 'Plans could not be loaded from the backend.'
    : '';

  useEffect(() => {
    setShowSignupPanel(isSignupMode);
  }, [isSignupMode]);

  useEffect(() => {
    if (requestedPlanId && planOptions.some((plan) => plan.value === requestedPlanId) && signupData.planId !== requestedPlanId) {
      setSignupData((prev) => ({
        ...prev,
        planId: requestedPlanId,
      }));
      return;
    }

    if (!signupData.planId && planOptions.length > 0) {
      setSignupData((prev) => ({
        ...prev,
        planId: planOptions[0].value,
      }));
    }
  }, [planOptions, requestedPlanId, signupData.planId]);

  useEffect(() => {
    if (!showSignupPanel || !shouldFocusPlanField) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      planSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      planSelectRef.current?.focus();
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [showSignupPanel, shouldFocusPlanField, signupData.planId]);

  const validateForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validateSignupForm = () => {
    const errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      clinicName: '',
      clinicEmail: '',
      countryCode: '',
      clinicPhone: '',
      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressZipCode: '',
      addressCountry: '',
      planId: '',
      code: '',
      acceptedTerms: '',
    };
    let isValid = true;

    if (!signupData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    if (!signupData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!signupData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    if (!signupData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (signupData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/\d/.test(signupData.password)) {
      errors.password = 'Password must contain at least one number';
      isValid = false;
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(signupData.password)) {
      errors.password = 'Password must contain at least one special character';
      isValid = false;
    }
    if (!signupData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    if (!signupData.clinicName.trim()) {
      errors.clinicName = 'Clinic name is required';
      isValid = false;
    }
    if (signupData.clinicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.clinicEmail)) {
      errors.clinicEmail = 'Please enter a valid clinic email address';
      isValid = false;
    }
    if (signupData.clinicPhone.trim() && !signupData.countryCode.trim()) {
      errors.countryCode = 'Country code is required';
      isValid = false;
    }
    if (!signupData.clinicPhone.trim()) {
      errors.clinicPhone = 'Clinic phone is required';
      isValid = false;
    } else {
      const phoneError = getCountryPhoneError(signupData.clinicPhone, selectedCountryPhone);
      if (phoneError) {
        errors.clinicPhone = phoneError.endsWith('.') ? phoneError.slice(0, -1) : phoneError;
        isValid = false;
      }
    }
    if (!signupData.addressStreet.trim()) {
      errors.addressStreet = 'Street address is required';
      isValid = false;
    } else if (signupData.addressStreet.trim().length < 5) {
      errors.addressStreet = 'Street address must be at least 5 characters';
      isValid = false;
    }
    if (!signupData.addressCity.trim()) {
      errors.addressCity = 'City is required';
      isValid = false;
    } else if (signupData.addressCity.trim().length < 2) {
      errors.addressCity = 'City must be at least 2 characters';
      isValid = false;
    }
    if (!signupData.addressState.trim()) {
      errors.addressState = 'County / region is required';
      isValid = false;
    } else if (signupData.addressState.trim().length < 2) {
      errors.addressState = 'County / region must be at least 2 characters';
      isValid = false;
    }
    if (!signupData.addressZipCode.trim()) {
      errors.addressZipCode = 'Postcode is required';
      isValid = false;
    } else if (signupData.addressZipCode.trim().length < 3) {
      errors.addressZipCode = 'Postcode must be at least 3 characters';
      isValid = false;
    }
    if (!signupData.addressCountry.trim()) {
      errors.addressCountry = 'Country is required';
      isValid = false;
    } else if (signupData.addressCountry.trim().length < 2) {
      errors.addressCountry = 'Country must be at least 2 characters';
      isValid = false;
    }
    if (!signupData.planId) {
      errors.planId = 'Please select a plan';
      isValid = false;
    }
    if (!signupData.acceptedTerms) {
      errors.acceptedTerms = 'You must accept the terms and conditions';
      isValid = false;
    }

    setSignupErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (fromPath && fromPath !== '/login') {
        navigate(fromPath, { replace: true });
        return;
      }
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignupForm()) {
      return;
    }

    try {
      setSignupError('');
      clearError();

      const response = await initiatePlanOnboarding({
        firstName: signupData.firstName.trim(),
        lastName: signupData.lastName.trim(),
        email: signupData.email.trim(),
        password: signupData.password,
        clinicName: signupData.clinicName.trim(),
        clinicEmail: signupData.clinicEmail.trim() || undefined,
        countryCode: signupData.countryCode.trim() || undefined,
        clinicPhone: signupData.clinicPhone.trim(),
        address: {
          street: signupData.addressStreet.trim(),
          city: signupData.addressCity.trim(),
          state: signupData.addressState.trim(),
          zipCode: signupData.addressZipCode.trim(),
          country: signupData.addressCountry.trim(),
        },
        planId: signupData.planId,
        startTrial: signupData.startTrial,
      }).unwrap();

      const onboardingId = response.response?.data?.onboardingId || response.response?.data?.id;

      if (!onboardingId) {
        throw new Error('Onboarding ID was not returned by the server.');
      }

      setPendingOnboardingId(onboardingId);
      setSignupStep(2);
      setOtp(['', '', '', '', '', '']);
      setSignupErrors((prev) => ({ ...prev, code: '' }));
      setSignupSuccess(response.message || 'We sent a verification code to your email address.');
    } catch (error: any) {
      setSignupError(error?.data?.message || error?.message || 'Failed to start onboarding. Please try again.');
    }
  };

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('').trim();

    if (code.length !== 6) {
      setSignupErrors((prev) => ({
        ...prev,
        code: 'Please enter the 6-digit verification code.',
      }));
      return;
    }

    if (!pendingOnboardingId) {
      setSignupError('Missing onboarding session. Please start signup again.');
      return;
    }

    try {
      setSignupError('');

      const verifyResponse = await verifyPlanOnboardingEmail({
        onboardingId: pendingOnboardingId,
        email: signupData.email.trim(),
        otp: code,
      }).unwrap();

      setSignupStep(3);
      setSignupSuccess(verifyResponse.message || 'Email verified successfully. Continue to checkout.');
    } catch (error: any) {
      setSignupError(error?.data?.message || error?.message || 'Failed to verify your email. Please try again.');
    }
  };

  const handleCreateCheckout = async () => {
    if (!pendingOnboardingId) {
      setSignupError('Missing onboarding session. Please start signup again.');
      return;
    }

    try {
      setSignupError('');
      setSignupSuccess('Creating your checkout session...');

      const checkoutResponse = await createPlanCheckout({
        onboardingId: pendingOnboardingId,
        email: signupData.email.trim(),
      }).unwrap();

      const checkoutUrl =
        checkoutResponse.response?.data?.url ||
        checkoutResponse.response?.data?.checkoutUrl ||
        checkoutResponse.response?.data?.checkoutURL;

      if (!checkoutUrl) {
        throw new Error('Checkout URL was not returned by the server.');
      }

      const finalUrl = checkoutUrl.startsWith('/') ? `${window.location.origin}${checkoutUrl}` : checkoutUrl;
      window.location.assign(finalUrl);
    } catch (error: any) {
      setSignupError(error?.data?.message || error?.message || 'Failed to create checkout. Please try again.');
      setSignupSuccess('Your email is already verified. You can retry checkout below.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextValue = e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
      ? e.target.checked
      : value;
    const normalizedValue = name === 'clinicPhone' && typeof nextValue === 'string'
      ? normalizePhoneDigits(nextValue, selectedCountryPhone)
      : nextValue;

    setSignupData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
    if (signupErrors[name as keyof typeof signupErrors]) {
      setSignupErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (name === 'countryCode' && signupErrors.clinicPhone) {
      setSignupErrors((prev) => ({
        ...prev,
        clinicPhone: '',
      }));
    }
    if (signupError) {
      setSignupError('');
    }
    if (signupSuccess) {
      setSignupSuccess('');
    }
    if (authError) {
      clearError();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const nextOtp = [...otp];
    const nextDigit = value.slice(-1);
    nextOtp[index] = nextDigit;
    setOtp(nextOtp);

    if (nextDigit && index < otpInputRefs.current.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (signupErrors.code) {
      setSignupErrors((prev) => ({
        ...prev,
        code: '',
      }));
    }
    if (signupSuccess) {
      setSignupSuccess('');
    }
    if (signupError) {
      setSignupError('');
    }
    if (authError) {
      clearError();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < otpInputRefs.current.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedDigits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otp.length);
    if (!pastedDigits) {
      return;
    }

    const nextOtp = [...otp];
    pastedDigits.split('').forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);

    const nextFocusIndex = Math.min(pastedDigits.length, otp.length - 1);
    otpInputRefs.current[nextFocusIndex]?.focus();

    if (signupErrors.code) {
      setSignupErrors((prev) => ({
        ...prev,
        code: '',
      }));
    }
    if (signupError) {
      setSignupError('');
    }
  };

  const resetSignupState = () => {
    setSignupStep(1);
    setOtp(['', '', '', '', '', '']);
    setSignupSuccess('');
    setSignupErrors({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      clinicName: '',
      clinicEmail: '',
      countryCode: '',
      clinicPhone: '',
      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressZipCode: '',
      addressCountry: '',
      planId: '',
      code: '',
      acceptedTerms: '',
    });
    setPendingOnboardingId('');
    setSignupError('');
    clearError();
  };

  const handleSwitchToSignin = async () => {
    if (pendingOnboardingId) {
      try {
        await cancelPlanOnboarding({
          onboardingId: pendingOnboardingId,
          email: signupData.email.trim(),
        }).unwrap();
      } catch (_error) {
        // Switching views should still work even if cancellation fails.
      }
    }

    setShowSignupPanel(false);
    resetSignupState();
  };

  const handleBackToSignup = async () => {
    try {
      if (pendingOnboardingId) {
        await cancelPlanOnboarding({
          onboardingId: pendingOnboardingId,
          email: signupData.email.trim(),
        }).unwrap();
      }
    } catch (_error) {
      // Returning to signup should still work even if cancellation fails.
    } finally {
      setSignupStep(1);
      setOtp(['', '', '', '', '', '']);
      setSignupErrors((prev) => ({ ...prev, code: '' }));
      setSignupSuccess('');
      setSignupError('');
      setPendingOnboardingId('');
      clearError();
    }
  };

  if (isAuthenticated) {
    return <Navigate to={fromPath || '/dashboard'} replace />;
  }

  return (
    <div className="h-screen w-full overflow-hidden flex bg-background">
      <div className="w-full lg:w-[54%] h-full overflow-y-auto flex flex-col justify-start px-8 py-10 sm:px-12 lg:px-16 xl:px-20 relative bg-white">
        <div className="w-full max-w-xl mx-auto">
        <div className="mb-8">
          <div className="mb-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/">Go to Home</Link>
            </Button>
          </div>
          <div className="flex justify-center mb-6">
            <img
              src="/images/inkind logo-04.png"
              alt="Inkind Suite"
              className="h-24 lg:h-32 w-auto object-contain"
            />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            {showSignupPanel ? (signupStep === 1 ? 'Create your account' : signupStep === 2 ? 'Verify your email' : 'Continue to checkout') : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground">
            {showSignupPanel
              ? signupStep === 1
                ? 'Enter your details to start clinic onboarding.'
                : signupStep === 2
                  ? `We sent a 6-digit code to ${signupData.email}. Enter it below to continue onboarding. If you do not see it, please check spam or junk.`
                  : 'Your email has been verified. Continue to Stripe checkout to finish setup.'
              : 'Please enter your details to sign in.'}
          </p>
        </div>

        {!showSignupPanel && authError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{authError}</span>
          </div>
        )}

        {showSignupPanel ? (
          <>
            {signupError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{signupError}</span>
              </div>
            )}

            {signupStep === 1 ? (
              <form onSubmit={handleSignupSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="signup-first-name" className="text-sm font-medium text-foreground">First Name</label>
                    <Input
                      id="signup-first-name"
                      name="firstName"
                      value={signupData.firstName}
                      onChange={handleSignupInputChange}
                      placeholder="Enter your first name"
                      className={`h-11 bg-white ${signupErrors.firstName ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {signupErrors.firstName && <p className="text-sm text-red-500">{signupErrors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-last-name" className="text-sm font-medium text-foreground">Last Name</label>
                    <Input
                      id="signup-last-name"
                      name="lastName"
                      value={signupData.lastName}
                      onChange={handleSignupInputChange}
                      placeholder="Enter your last name"
                      className={`h-11 bg-white ${signupErrors.lastName ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {signupErrors.lastName && <p className="text-sm text-red-500">{signupErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={signupData.email}
                    onChange={handleSignupInputChange}
                    placeholder="Enter your email"
                    className={`h-11 bg-white ${signupErrors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {signupErrors.email && <p className="text-sm text-red-500">{signupErrors.email}</p>}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="signup-clinic-name" className="text-sm font-medium text-foreground">Clinic Name</label>
                    <Input
                      id="signup-clinic-name"
                      name="clinicName"
                      value={signupData.clinicName}
                      onChange={handleSignupInputChange}
                      placeholder="Enter your clinic name"
                      className={`h-11 bg-white ${signupErrors.clinicName ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {signupErrors.clinicName && <p className="text-sm text-red-500">{signupErrors.clinicName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-clinic-email" className="text-sm font-medium text-foreground">Clinic Email</label>
                    <Input
                      id="signup-clinic-email"
                      name="clinicEmail"
                      type="email"
                      value={signupData.clinicEmail}
                      onChange={handleSignupInputChange}
                      placeholder="Enter clinic email"
                      className={`h-11 bg-white ${signupErrors.clinicEmail ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {signupErrors.clinicEmail && <p className="text-sm text-red-500">{signupErrors.clinicEmail}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="signup-country-code" className="text-sm font-medium text-foreground">Country Code</label>
                    <Select
                      id="signup-country-code"
                      name="countryCode"
                      value={signupData.countryCode}
                      onChange={handleSignupInputChange}
                      className={`${signupErrors.countryCode ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    >
                      {COUNTRY_PHONE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    {signupErrors.countryCode && <p className="text-sm text-red-500">{signupErrors.countryCode}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-clinic-phone" className="text-sm font-medium text-foreground">Clinic Phone</label>
                    <Input
                      id="signup-clinic-phone"
                      name="clinicPhone"
                      value={signupData.clinicPhone}
                      onChange={handleSignupInputChange}
                      placeholder={selectedCountryPhone.example}
                      inputMode="numeric"
                      maxLength={selectedCountryPhone.maxDigits}
                      className={`h-11 bg-white ${signupErrors.clinicPhone ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {signupErrors.clinicPhone && <p className="text-sm text-red-500">{signupErrors.clinicPhone}</p>}
                    {!signupErrors.clinicPhone && (
                      <p className="text-xs text-muted-foreground">
                        {selectedCountryPhone.minDigits === selectedCountryPhone.maxDigits
                          ? selectedCountryPhone.value === '+44'
                            ? 'Use your full UK number, for example 07860599155'
                            : `${selectedCountryPhone.maxDigits} digits required`
                          : `${selectedCountryPhone.minDigits}-${selectedCountryPhone.maxDigits} digits required`}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="signup-plan" className="text-sm font-medium text-foreground">Plan</label>
                    <Select
                      ref={planSelectRef}
                      id="signup-plan"
                      name="planId"
                      value={signupData.planId}
                      onChange={handleSignupInputChange}
                      className={`${signupErrors.planId ? 'border-red-500' : ''}`}
                      disabled={isPlanSelectDisabled}
                    >
                      <option value="">Select a plan</option>
                      {planOptions.map((plan) => (
                        <option key={plan.value} value={plan.value}>
                          {plan.label}
                        </option>
                      ))}
                    </Select>
                    {planLoadErrorMessage && <p className="text-sm text-red-500">{planLoadErrorMessage}</p>}
                    {signupErrors.planId && <p className="text-sm text-red-500">{signupErrors.planId}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Clinic Address</label>
                    <p className="text-xs text-muted-foreground mt-1">Enter the full clinic address in separate fields.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-address-street" className="text-sm font-medium text-foreground">Street</label>
                    <Input
                      id="signup-address-street"
                      name="addressStreet"
                      value={signupData.addressStreet}
                      onChange={handleSignupInputChange}
                      placeholder="221B Baker Street"
                      className={`h-11 bg-white ${signupErrors.addressStreet ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {signupErrors.addressStreet && <p className="text-sm text-red-500">{signupErrors.addressStreet}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="signup-address-city" className="text-sm font-medium text-foreground">City</label>
                      <Input
                        id="signup-address-city"
                        name="addressCity"
                        value={signupData.addressCity}
                        onChange={handleSignupInputChange}
                        placeholder="London"
                        className={`h-11 bg-white ${signupErrors.addressCity ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {signupErrors.addressCity && <p className="text-sm text-red-500">{signupErrors.addressCity}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-address-state" className="text-sm font-medium text-foreground">County / Region</label>
                      <Input
                        id="signup-address-state"
                        name="addressState"
                        value={signupData.addressState}
                        onChange={handleSignupInputChange}
                        placeholder="Greater London"
                        className={`h-11 bg-white ${signupErrors.addressState ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {signupErrors.addressState && <p className="text-sm text-red-500">{signupErrors.addressState}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="signup-address-zip" className="text-sm font-medium text-foreground">Postcode</label>
                      <Input
                        id="signup-address-zip"
                        name="addressZipCode"
                        value={signupData.addressZipCode}
                        onChange={handleSignupInputChange}
                        placeholder="SW1A 1AA"
                        className={`h-11 bg-white ${signupErrors.addressZipCode ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {signupErrors.addressZipCode && <p className="text-sm text-red-500">{signupErrors.addressZipCode}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-address-country" className="text-sm font-medium text-foreground">Country</label>
                      <Input
                        id="signup-address-country"
                        name="addressCountry"
                        value={signupData.addressCountry}
                        onChange={handleSignupInputChange}
                        placeholder="United Kingdom"
                        className={`h-11 bg-white ${signupErrors.addressCountry ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {signupErrors.addressCountry && <p className="text-sm text-red-500">{signupErrors.addressCountry}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupData.password}
                      onChange={handleSignupInputChange}
                      placeholder="Create a password"
                      className={`h-11 bg-white pr-10 ${signupErrors.password ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupErrors.password ? (
                    <p className="text-sm text-red-500">{signupErrors.password}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long and include at least one number and one special character.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-confirm-password" className="text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showSignupConfirmPassword ? 'text' : 'password'}
                      value={signupData.confirmPassword}
                      onChange={handleSignupInputChange}
                      placeholder="Confirm your password"
                      className={`h-11 bg-white pr-10 ${signupErrors.confirmPassword ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupErrors.confirmPassword && <p className="text-sm text-red-500">{signupErrors.confirmPassword}</p>}
                </div>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-white px-4 py-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name="startTrial"
                      checked={signupData.startTrial}
                      onChange={handleSignupInputChange}
                      className="mt-0.5 h-4 w-4 rounded border-border"
                      disabled={isLoading}
                    />
                    <span>Start with a free trial before paid billing begins.</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-white px-4 py-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      checked={signupData.acceptedTerms}
                      onChange={handleSignupInputChange}
                      className="mt-0.5 h-4 w-4 rounded border-border"
                      disabled={isLoading}
                    />
                    <span>
                      I agree to the{' '}
                      <Link to="/legal/terms-of-service" className="font-medium text-primary hover:underline">
                        Terms of Service
                      </Link>
                      {', '}
                      <Link to="/legal/privacy-policy" className="font-medium text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      {' and '}
                      <Link to="/legal/cookie-policy" className="font-medium text-primary hover:underline">
                        Cookie Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {signupErrors.acceptedTerms && <p className="text-sm text-red-500">{signupErrors.acceptedTerms}</p>}
                </div>

                {signupSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {signupSuccess}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? 'Preparing...' : (
                    <>
                      Continue to verify email
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : signupStep === 2 ? (
              <form onSubmit={handleVerifySignupOtp} className="space-y-6" noValidate>
                <div className="rounded-2xl border border-border/60 bg-white px-4 py-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Verification Summary</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Email: {signupData.email}</p>
                    <p>Clinic: {signupData.clinicName}</p>
                    <p>Plan: {selectedPlan?.name || 'Selected plan'}</p>
                    <p>Onboarding ID: {pendingOnboardingId || 'Pending'}</p>
                  </div>
                </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{signupData.email}</span>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  If the code does not arrive within a few minutes, check spam or junk before trying again.
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <KeyRound className="h-4 w-4" />
                    <span>Verification Code</span>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(element) => {
                          otpInputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className={`h-12 w-12 px-0 text-center text-lg font-bold ${signupErrors.code ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                  {signupErrors.code && <p className="text-sm text-red-500 text-center">{signupErrors.code}</p>}
                </div>

                {signupSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {signupSuccess}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify email and continue'}
                </Button>

                <button
                  type="button"
                  onClick={handleBackToSignup}
                  className="w-full text-sm font-medium text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  Back to signup
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/60 bg-white px-4 py-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Checkout Summary</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Email: {signupData.email}</p>
                    <p>Clinic: {signupData.clinicName}</p>
                    <p>Plan: {selectedPlan?.name || 'Selected plan'}</p>
                    <p>Onboarding ID: {pendingOnboardingId || 'Pending'}</p>
                  </div>
                </div>

                {signupSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {signupSuccess}
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full h-11 text-base shadow-lg shadow-primary/20"
                  disabled={isLoading}
                  onClick={handleCreateCheckout}
                >
                  {isLoading ? 'Creating checkout...' : 'Continue to checkout'}
                </Button>

                <button
                  type="button"
                  onClick={handleBackToSignup}
                  className="w-full text-sm font-medium text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  Back to signup
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={handleSwitchToSignin}
                  className="font-medium text-foreground hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`h-11 bg-white ${formErrors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`h-11 bg-white pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowSignupPanel(true);
                    resetSignupState();
                  }}
                  className="font-medium text-foreground hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </>
        )}
        </div>
      </div>

      <div className="hidden lg:block lg:w-[46%] h-full relative overflow-hidden bg-[#E8EAE3]">
        <div className="h-full w-full">
          <img
            src="/images/logindemo4.png"
            alt="Therapy Session Illustration"
            className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
