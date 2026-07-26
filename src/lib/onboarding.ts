/**
 * Resolve clinic onboarding state from the authenticated user payload.
 * Users without a clinic (e.g. providers) are treated as already onboarded.
 */
export function getClinicOnboardingState(user: any): {
  hasClinic: boolean;
  isOnboarded: boolean;
  onboardingStep: number;
} {
  const clinic =
    user?.clinicMemberships?.[0]?.clinic ||
    user?.ownedClinics?.[0] ||
    null;

  if (!clinic) {
    return {
      hasClinic: false,
      isOnboarded: true,
      onboardingStep: 1,
    };
  }

  return {
    hasClinic: true,
    // Only an explicit true allows access to the main app
    isOnboarded: clinic.isOnboarded === true,
    onboardingStep: Number(clinic.onboardingStep) || 1,
  };
}
