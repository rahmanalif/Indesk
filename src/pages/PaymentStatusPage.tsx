import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CreditCard, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function normalizeStatus(rawStatus: string | null) {
  const value = (rawStatus || '').toLowerCase();

  if (['success', 'succeeded', 'paid', 'completed'].includes(value)) {
    return 'success';
  }

  if (['failed', 'failure', 'error'].includes(value)) {
    return 'failed';
  }

  return 'unknown';
}

export function PaymentStatusPage() {
  const [searchParams] = useSearchParams();

  const status = normalizeStatus(searchParams.get('status'));
  const onboardingId = searchParams.get('onboardingId');
  const email = searchParams.get('email');
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId');
  const message = searchParams.get('message');

  const config = {
    success: {
      title: 'Payment Successful',
      description: 'The onboarding payment or trial setup completed successfully.',
      icon: CheckCircle2,
      iconClassName: 'text-green-600',
      surfaceClassName: 'border-green-200 bg-green-50',
    },
    failed: {
      title: 'Payment Failed',
      description: 'The payment did not complete. Review the checkout details and retry if needed.',
      icon: XCircle,
      iconClassName: 'text-red-600',
      surfaceClassName: 'border-red-200 bg-red-50',
    },
    unknown: {
      title: 'Payment Status Unknown',
      description: 'No recognized payment status was provided in the URL.',
      icon: AlertTriangle,
      iconClassName: 'text-amber-600',
      surfaceClassName: 'border-amber-200 bg-amber-50',
    },
  }[status];

  const StatusIcon = config.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Internal Payment Status</h1>
        <p className="text-muted-foreground mt-1">
          This page is restricted to admin access and is intended for internal payment monitoring.
        </p>
      </div>

      <Card className={`shadow-md ${config.surfaceClassName}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-7 w-7 ${config.iconClassName}`} />
            <div>
              <CardTitle>{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>Values are read from the custom URL query parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <p className="mt-1 font-semibold text-foreground">{status}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Onboarding ID</p>
              <p className="mt-1 font-semibold text-foreground break-all">{onboardingId || 'Not provided'}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 font-semibold text-foreground break-all">{email || 'Not provided'}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Stripe Session</p>
              <p className="mt-1 font-semibold text-foreground break-all">{sessionId || 'Not provided'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Message</p>
            <p className="mt-1 text-sm text-foreground">{message || 'No custom message provided.'}</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link to="/subscription">Back to Subscription</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
