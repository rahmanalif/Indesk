import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { RootState } from '../store';
import { getClinicOnboardingState } from '../lib/onboarding';
import { useGetOnboardingStatusQuery } from '../redux/api/onboardingApi';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * Blocks clinic admins from the main app until clinic onboarding is complete.
 * Clinicians/members and users without a clinic pass through.
 */
export function RequireOnboarding({ children }: RequireOnboardingProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const { isClinicAdmin, isOnboarded: localOnboarded } = getClinicOnboardingState(user);

  const { data: statusResponse, isLoading, isFetching } = useGetOnboardingStatusQuery(
    undefined,
    { skip: !isClinicAdmin || localOnboarded },
  );

  if (!isClinicAdmin || localOnboarded) {
    return <>{children}</>;
  }

  if ((isLoading || isFetching) && statusResponse === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const apiOnboarded = statusResponse?.response?.data?.isOnboarded === true;
  if (!apiOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
