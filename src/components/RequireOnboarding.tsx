import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getClinicOnboardingState } from '../lib/onboarding';

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

  const { hasClinic, isOnboarded } = getClinicOnboardingState(user);

  if (hasClinic && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
