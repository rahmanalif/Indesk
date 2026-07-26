/**
 * Resolve clinic onboarding state from the authenticated user payload.
 * Users without a clinic (e.g. providers) are treated as already onboarded.
 * Only clinic admins/superAdmins are required to complete clinic onboarding.
 */
export function getClinicOnboardingState(user: any): {
  hasClinic: boolean;
  isOnboarded: boolean;
  onboardingStep: number;
  clinicRole: string | null;
  isClinicAdmin: boolean;
  requiresClinicOnboarding: boolean;
  membershipId: string | null;
} {
  const membership = user?.clinicMemberships?.[0] || null;
  const clinic =
    membership?.clinic ||
    user?.ownedClinics?.[0] ||
    null;

  if (!clinic) {
    return {
      hasClinic: false,
      isOnboarded: true,
      onboardingStep: 1,
      clinicRole: null,
      isClinicAdmin: false,
      requiresClinicOnboarding: false,
      membershipId: null,
    };
  }

  const clinicRole =
    membership?.role ||
    (user?.ownedClinics?.[0] ? 'superAdmin' : null);

  const isClinicAdmin = clinicRole === 'superAdmin' || clinicRole === 'admin';
  const isOnboarded = clinic.isOnboarded === true;

  return {
    hasClinic: true,
    isOnboarded,
    onboardingStep: Number(clinic.onboardingStep) || 1,
    clinicRole,
    isClinicAdmin,
    requiresClinicOnboarding: isClinicAdmin && !isOnboarded,
    membershipId: membership?.id || null,
  };
}
