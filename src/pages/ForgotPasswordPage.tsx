import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: OTP, 3: New Pass, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, send OTP here
    setStep(2);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate OTP
    setStep(3);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset Password Logic
    setStep(4);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input could go here
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Form */}
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
            {step === 1 && 'Enter your email address and we’ll send you a verification code.'}
            {step === 2 && `We sent a 6-digit code to ${email}. Enter it below.`}
            {step === 3 && 'Create a strong password for your account.'}
            {step === 4 && 'Your password has been successfully reset. You can now login.'}
          </p>
        </div>

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
              />
            </div>
            <Button type="submit" className="w-full h-11">Send Reset Code</Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg font-bold"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                />
              ))}
            </div>
            <Button type="submit" className="w-full h-11">Verify Code</Button>
            <p className="text-xs text-center text-muted-foreground">
              Didn't receive code? <span className="text-primary font-medium cursor-pointer">Resend</span>
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
              />
            </div>
            <Button type="submit" className="w-full h-11">Reset Password</Button>
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

      {/* Right Side - Same Illustration for consistency */}
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