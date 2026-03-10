import { useEffect, useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, ArrowRight, AlertCircle, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, verifyAccount, isAuthenticated, isLoading, error, clearError } = useAuth();
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const isSignupMode = new URLSearchParams(location.search).get('mode') === 'signup';

  const [showSignupPanel, setShowSignupPanel] = useState(isSignupMode);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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
    code: '',
    acceptedTerms: '',
  });
  const [signupSuccess, setSignupSuccess] = useState('');

  useEffect(() => {
    setShowSignupPanel(isSignupMode);
  }, [isSignupMode]);

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
    } else if (signupData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (!signupData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    const result = await register(
      signupData.firstName.trim(),
      signupData.lastName.trim(),
      signupData.email.trim(),
      signupData.password
    );

    if (result.success) {
      setSignupStep(2);
      setOtp(['', '', '', '', '', '']);
      setSignupErrors((prev) => ({ ...prev, code: '' }));
      setSignupSuccess(result.data?.message || 'Thank you for registering. Please verify your email.');
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

    const result = await verifyAccount(signupData.email.trim(), code);
    if (result.success) {
      setSignupSuccess(result.data?.message || 'Account verified successfully.');
      if (fromPath && fromPath !== '/login') {
        navigate(fromPath, { replace: true });
        return;
      }
      navigate('/dashboard', { replace: true });
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

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (signupErrors[name as keyof typeof signupErrors]) {
      setSignupErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (signupSuccess) {
      setSignupSuccess('');
    }
    if (error) {
      clearError();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (signupErrors.code) {
      setSignupErrors((prev) => ({
        ...prev,
        code: '',
      }));
    }
    if (signupSuccess) {
      setSignupSuccess('');
    }
    if (error) {
      clearError();
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
      code: '',
      acceptedTerms: '',
    });
    clearError();
  };

  if (isAuthenticated) {
    return <Navigate to={fromPath || '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full lg:w-[54%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 relative bg-white">
        <div className="mb-12">
          <div className="flex justify-center mb-10">
            <img
              src="/images/inkind logo-04.png"
              alt="Inkind Suite"
              className="h-40 w-auto object-contain"
            />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            {showSignupPanel ? (signupStep === 1 ? 'Create your account' : 'Verify your account') : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground">
            {showSignupPanel
              ? signupStep === 1
                ? 'Enter your details to create a new account.'
                : `We sent a 6-digit code to ${signupData.email}. Enter it below.`
              : 'Please enter your details to sign in.'}
          </p>
        </div>

        {!showSignupPanel && error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {showSignupPanel ? (
          <>
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
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
                  {signupErrors.password && <p className="text-sm text-red-500">{signupErrors.password}</p>}
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
                      name="acceptedTerms"
                      checked={signupData.acceptedTerms}
                      onChange={handleSignupInputChange}
                      className="mt-0.5 h-4 w-4 rounded border-border"
                      disabled={isLoading}
                    />
                    <span>I agree to the terms and conditions.</span>
                  </label>
                  {signupErrors.acceptedTerms && <p className="text-sm text-red-500">{signupErrors.acceptedTerms}</p>}
                </div>

                {signupSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {signupSuccess}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? 'Signing up...' : (
                    <>
                      Sign up
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifySignupOtp} className="space-y-6" noValidate>
                <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{signupData.email}</span>
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
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
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
                  {isLoading ? 'Verifying...' : 'Verify code'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setSignupStep(1);
                    setOtp(['', '', '', '', '', '']);
                    setSignupErrors((prev) => ({ ...prev, code: '' }));
                    setSignupSuccess('');
                    clearError();
                  }}
                  className="w-full text-sm font-medium text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  Back to signup
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowSignupPanel(false);
                    resetSignupState();
                  }}
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

            <div className="mt-8 text-center">
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

      <div className="hidden lg:block lg:w-[70%] relative overflow-hidden bg-[#E8EAE3]">
        <div className="absolute inset-2 rounded-3xl overflow-hidden shadow-2xl border border-white/20 ">
          <img
            src="/images/logindemo3.png"
            alt="Therapy Session Illustration"
            className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
