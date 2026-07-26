import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { RootState } from '../store';
import { getClinicOnboardingState } from '../lib/onboarding';
import { useGetOnboardingStatusQuery } from '../redux/api/onboardingApi';

const PUBLIC_PATH_PREFIXES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/legal',
  '/client-intake-form',
  '/assessment-portal',
  '/clinic-portal',
  '/appointments/payment-success',
  '/landing',
];

function isExemptPath(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * Universal onboarding lock for clinic admins:
 * - unfinished → any non-exempt app route redirects to /onboarding
 * - finished → /onboarding redirects to /dashboard
 * Prefers live API status over stale localStorage.
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { isClinicAdmin, isOnboarded: localOnboarded } = getClinicOnboardingState(user);

  const shouldCheck = Boolean(isAuthenticated && user && isClinicAdmin);
  const { data: statusResponse, isLoading, isFetching, isError } =
    useGetOnboardingStatusQuery(undefined, {
      skip: !shouldCheck,
      refetchOnMountOrArgChange: true,
    });

  if (!shouldCheck) {
    return <>{children}</>;
  }

  if ((isLoading || isFetching) && statusResponse === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const apiOnboarded = statusResponse?.response?.data?.isOnboarded;
  const isOnboarded =
    typeof apiOnboarded === 'boolean'
      ? apiOnboarded === true
      : !isError && localOnboarded;

  const onOnboardingPath = location.pathname === '/onboarding' || location.pathname.startsWith('/onboarding/');
  const exempt = isExemptPath(location.pathname);

  if (!isOnboarded && !onOnboardingPath && !exempt) {
    return <Navigate to="/onboarding" replace />;
  }

  if (isOnboarded && onOnboardingPath) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
