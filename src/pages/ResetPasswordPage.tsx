import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { WatercolorBackground } from '../components/ui/WatercolorBackground';
import { cn } from '../lib/utils';
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const requirements = [{
    label: 'At least 8 characters',
    valid: password.length >= 8
  }, {
    label: 'Contains a number',
    valid: /\d/.test(password)
  }, {
    label: 'Contains a special character',
    valid: /[!@#$%^&*]/.test(password)
  }];
  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };
  return <WatercolorBackground className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Set new password
          </CardTitle>
          <CardDescription>
            Create a strong password for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleReset} className="space-y-4">
            <Input type="password" placeholder="••••••••" label="New Password" value={password} onChange={e => setPassword(e.target.value)} required />

            {/* Password Strength Indicators */}
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Password requirements:
              </p>
              {requirements.map((req, i) => <div key={i} className="flex items-center gap-2 text-xs">
                  {req.valid ? <Check className="h-3 w-3 text-green-500" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 ml-1 mr-0.5" />}
                  <span className={cn(req.valid ? 'text-green-700' : 'text-muted-foreground')}>
                    {req.label}
                  </span>
                </div>)}
            </div>

            <Input type="password" placeholder="••••••••" label="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined} />

            <Button className="w-full" size="lg" isLoading={isLoading} disabled={!requirements.every(r => r.valid) || password !== confirmPassword}>
              Reset Password
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </WatercolorBackground>;
}