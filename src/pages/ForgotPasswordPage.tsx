import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../redux/api/authApi';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: OTP, 3: New Pass, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    try {
      const response = await forgotPassword({ email: email.trim() }).unwrap();
      setSuccess(response.message || 'A verification code has been sent to your email.');
      setStep(2);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to send reset code. Please try again.');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.join('').trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setStep(3);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await resetPassword({
        email: email.trim(),
        otp: otp.join('').trim(),
        password,
      }).unwrap();

      setSuccess(response.message || 'Your password has been successfully reset.');
      setStep(4);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to reset password. Please try again.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (error) {
      setError('');
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await forgotPassword({ email: email.trim() }).unwrap();
      setSuccess(response.message || 'A new verification code has been sent.');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative bg-white">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>

          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
            {step === 1 && <Mail className="w-6 h-6" />}
            {step === 2 && <KeyRound className="w-6 h-6" />}
            {step === 3 && <KeyRound className="w-6 h-6" />}
            {step === 4 && <CheckCircle2 className="w-6 h-6" />}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter Code'}
            {step === 3 && 'Set New Password'}
            {step === 4 && 'Password Reset!'}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && 'Enter your email address and we will send you a verification code.'}
            {step === 2 && `We sent a 6-digit code to ${email}. Enter it below.`}
            {step === 3 && 'Create a strong password for your account.'}
            {step === 4 && 'Your password has been successfully reset. You can now login.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg font-bold"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                />
              ))}
            </div>
            <Button type="submit" className="w-full h-11">Verify Code</Button>
            <p className="text-xs text-center text-muted-foreground">
              Didn't receive code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                className="text-primary font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Resend'}
              </button>
            </p>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                disabled={isResetting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
                disabled={isResetting}
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isResetting}>
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <Button onClick={() => navigate('/login')} className="w-full h-11">
              Back to Login <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-[#E8EAE3]">
        <div className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          <img
            src="/images/I want a beautiful, whimsical, delicate, pale watercolour painting of a an abstract olive green shapes with sigmund freud in an armchair talking to a paitent on the couch, in a light olive green background. Mak (1).jpg"
            alt="Illustration"
            className="h-full w-full object-cover opacity-90"
          />
        </div>
      </div>
    </div>
  );
}
