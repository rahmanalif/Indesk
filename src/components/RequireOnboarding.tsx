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
 * Blocks access to the main app until clinic post-login onboarding is complete.
 * Provider/users without a clinic pass through.
 */
export function RequireOnboarding({ children }: RequireOnboardingProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const { hasClinic, isOnboarded: localOnboarded } = getClinicOnboardingState(user);

  const { data: statusResponse, isLoading, isFetching } = useGetOnboardingStatusQuery(
    undefined,
    { skip: !hasClinic },
  );

  if (!hasClinic) {
    return <>{children}</>;
  }

  // Wait for authoritative status unless the local profile already confirms completion
  // (avoids bouncing users back after they finish onboarding).
  if (!localOnboarded && (isLoading || isFetching) && statusResponse === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const apiOnboarded = statusResponse?.response?.data?.isOnboarded === true;
  const isOnboarded = localOnboarded || apiOnboarded;

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
