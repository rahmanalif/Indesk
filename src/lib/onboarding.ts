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
    // Missing field (older payloads) should not force the wizard
    isOnboarded: clinic.isOnboarded !== false,
    onboardingStep: Number(clinic.onboardingStep) || 1,
  };
}
