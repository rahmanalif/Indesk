import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getClinicOnboardingState } from '../lib/onboarding';
import { hasAvailabilityPromptCookie } from '../lib/availabilityPromptCookie';
import { AvailabilityPromptModal } from './modals/AvailabilityPromptModal';

/**
 * Shows a dismissible availability setup prompt for clinic members/clinicians
 * after login when they have not already dismissed or saved via cookie.
 */
export function AvailabilityPromptHost() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const { membershipId, clinicRole, isClinicAdmin, hasClinic } =
    getClinicOnboardingState(user);

  const membership = user?.clinicMemberships?.[0];

  const shouldPrompt =
    isAuthenticated &&
    Boolean(user?.id) &&
    hasClinic &&
    Boolean(membershipId) &&
    !isClinicAdmin &&
    clinicRole === 'clinician' &&
    !hasAvailabilityPromptCookie(user!.id);

  useEffect(() => {
    setIsOpen(shouldPrompt);
  }, [shouldPrompt]);

  if (!user?.id || !membershipId) {
    return null;
  }

  return (
    <AvailabilityPromptModal
      isOpen={isOpen}
      userId={user.id}
      memberId={membershipId}
      initialSchedule={membership?.availabilitySchedule}
      onClose={() => setIsOpen(false)}
    />
  );
}
