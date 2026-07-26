import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingIntegrationSummary {
  type: string;
  status: string;
  isConfigured: boolean;
  isConnected: boolean;
}

export interface OnboardingStatusData {
  isOnboarded: boolean;
  onboardingStep: number;
  memberId: string | null;
  clinicRole: string | null;
  canEdit: boolean;
  timezone: string;
  clinic: {
    id: string;
    name: string;
    email: string | null;
    url: string | null;
    phoneNumber: string | null;
    countryCode: string | null;
    isActive: boolean;
    stripeConnectAccountId: string | null;
    stripeConnectStatus: string | null;
  };
  availabilitySchedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
    breakTime?: { startTime: string; endTime: string } | null;
  }>;
  integrations: OnboardingIntegrationSummary[];
}

interface ApiEnvelope<T> {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: T;
  };
}

export type OnboardingStatusResponse = ApiEnvelope<OnboardingStatusData>;

export type SaveOnboardingStepRequest =
  | {
      step: 1;
      data: {
        name: string;
        url?: string;
        email?: string;
        phoneNumber?: string;
        countryCode?: string;
        timezone?: string;
      };
    }
  | {
      step: 2;
      data: {
        availabilitySchedule: Array<{
          day: string;
          startTime: string;
          endTime: string;
          breakTime?: { startTime: string; endTime: string };
        }>;
      };
    }
  | {
      step: 3 | 4;
      data?: { skip?: boolean };
    };

export type SaveOnboardingStepResponse = ApiEnvelope<{
  isOnboarded: boolean;
  onboardingStep: number;
  completedStep: number;
}>;

export type CompleteOnboardingResponse = ApiEnvelope<{
  isOnboarded: boolean;
  onboardingStep: number;
}>;

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['OnboardingStatus'],
  endpoints: (builder) => ({
    getOnboardingStatus: builder.query<OnboardingStatusResponse, void>({
      query: () => '/onboarding/status',
      providesTags: ['OnboardingStatus'],
    }),
    saveOnboardingStep: builder.mutation<
      SaveOnboardingStepResponse,
      SaveOnboardingStepRequest
    >({
      query: (body) => ({
        url: '/onboarding/step',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['OnboardingStatus'],
    }),
    completeOnboarding: builder.mutation<CompleteOnboardingResponse, void>({
      query: () => ({
        url: '/onboarding/complete',
        method: 'POST',
      }),
      invalidatesTags: ['OnboardingStatus'],
    }),
  }),
});

export const {
  useGetOnboardingStatusQuery,
  useSaveOnboardingStepMutation,
  useCompleteOnboardingMutation,
} = onboardingApi;
