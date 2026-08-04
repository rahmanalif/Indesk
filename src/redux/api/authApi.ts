import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import type { AvailabilityScheduleApiItem } from "../../lib/clinicianAvailability";

interface LoginCredentials {
  email: string;
  password: string;
  timezone?: string;
}

interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string;
  isEmailVerified: boolean;
  fcmToken: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  isRestricted: boolean;
  restrictionReason: string | null;
  bio: string | null;
  timezone: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  clinicMemberships?: Array<{
    id: string;
    role: string;
    clinic?: {
      id: string;
      name: string;
      isActive?: boolean;
      isOnboarded?: boolean;
      onboardingStep?: number;
    };
  }>;
  ownedClinics?: Array<{
    id: string;
    name: string;
    isActive?: boolean;
    isOnboarded?: boolean;
    onboardingStep?: number;
  }>;
  subscription?: {
    id: string;
    clinicId: string;
    planId: string;
    status: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    trialStart: string | null;
    trialEnd: string | null;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
    plan?: {
      id: string;
      name: string;
      type: string;
      description?: string | null;
      price: number;
    };
  } | null;
}

interface LoginResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: AuthenticatedUser;
  };
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "user";
  timezone?: string;
}

interface RegisterResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: Record<string, never>;
  };
}

interface VerifyAccountRequest {
  email: string;
  code: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: Record<string, unknown>;
  };
}

interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

interface ResetPasswordResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: Record<string, unknown>;
  };
}

interface VerifyAccountResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: AuthenticatedUser & {
      permissions?: Record<string, boolean>;
      lastPasswordChangedAt?: string | null;
    };
  };
}

interface LogoutRequest {
  refreshToken?: string;
}

interface LogoutResponse {
  success: boolean;
  status: number;
  message: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  status: number;
  message: string;
}

interface UpdateSelfProfileRequest {
  firstName: string;
  lastName: string;
  avatar?: File | null;
}

interface SelfClinicMembership {
  id: string;
  role: string;
  clinicianToken: string | null;
  availabilitySchedule?: AvailabilityScheduleApiItem[] | null;
  specialization: string[];
  clinic?: {
    id: string;
    name: string;
    email?: string | null;
    url?: string | null;
    phoneNumber?: string | null;
    countryCode?: string | null;
    isActive?: boolean;
    isOnboarded?: boolean;
    onboardingStep?: number;
  };
}

interface SelfOwnedClinic {
  id: string;
  name: string;
  email: string;
  url?: string | null;
  logo: string | null;
  color: string | null;
  isActive: boolean;
  isOnboarded?: boolean;
  onboardingStep?: number;
}

interface SelfUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string | null;
  isEmailVerified: boolean;
  phoneNumber: string | null;
  countryCode: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Record<string, boolean>;
  clinicMemberships?: SelfClinicMembership[];
  ownedClinics?: SelfOwnedClinic[];
}

interface GetSelfProfileResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: SelfUserData;
  };
}

interface UpdateSelfProfileResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: SelfUserData;
  };
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    verifyAccount: builder.mutation<
      VerifyAccountResponse,
      VerifyAccountRequest
    >({
      query: (body) => ({
        url: "/auth/verify-account",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
    updateSelfProfile: builder.mutation<
      UpdateSelfProfileResponse,
      UpdateSelfProfileRequest
    >({
      query: ({ firstName, lastName, avatar }) => {
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        if (avatar) {
          formData.append("avatar", avatar);
        }

        return {
          url: "/user/self/update",
          method: "PATCH",
          body: formData,
          headers: {
            "x-skip-content-type": "true",
          },
        };
      },
    }),
    getSelfProfile: builder.query<GetSelfProfileResponse, void>({
      query: () => ({
        url: "/user/self/in",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyAccountMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetSelfProfileQuery,
  useLazyGetSelfProfileQuery,
  useUpdateSelfProfileMutation,
  useChangePasswordMutation,
} = authApi;
