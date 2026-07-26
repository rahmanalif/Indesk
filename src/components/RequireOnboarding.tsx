import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * Auth gate for protected app layout.
 * Clinic-admin onboarding enforcement lives in OnboardingGuard (router-level).
 */
export function RequireOnboarding({ children }: RequireOnboardingProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
