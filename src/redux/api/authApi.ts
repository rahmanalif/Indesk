import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      avatar: string;
      isEmailVerified: boolean;
      fcmToken: string;
      phoneNumber: string | null;
      countryCode: string | null;
      isRestricted: boolean;
      restrictionReason: string | null;
      bio: string | null;
      isOnline: boolean;
      lastSeen: string | null;
      lastLoginAt: string;
      createdAt: string;
      updatedAt: string;
    };
    tokens: {
      access: {
        token: string;
        expiresAt: string;
      };
      refresh: {
        token: string;
        expiresAt: string;
      };
    };
  };
}

interface LogoutRequest {
  refreshToken: string;
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
  availability: string[];
  specialization: string[];
}

interface SelfOwnedClinic {
  id: string;
  name: string;
  email: string;
  logo: string | null;
  color: string | null;
  isActive: boolean;
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
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_AUTH_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const skipContentType = headers.get('x-skip-content-type') === 'true';
      if (skipContentType) {
        headers.delete('x-skip-content-type');
      } else {
        headers.set('Content-Type', 'application/json');
      }

      const state = getState() as RootState;
      const expiresAt = state.auth.tokens?.access?.expiresAt;
      const isReduxTokenValid = expiresAt ? new Date(expiresAt) > new Date() : true;
      let token = isReduxTokenValid ? state.auth.tokens?.access?.token : null;

      if (!token) {
        const localExpiry = localStorage.getItem('accessTokenExpiry');
        const isLocalValid = localExpiry ? new Date(localExpiry) > new Date() : false;
        token = isLocalValid ? localStorage.getItem('accessToken') : null;
      }

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
    }),
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),
    updateSelfProfile: builder.mutation<UpdateSelfProfileResponse, UpdateSelfProfileRequest>({
      query: ({ firstName, lastName, avatar }) => {
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        if (avatar) {
          formData.append('avatar', avatar);
        }

        return {
          url: '/user/self/update',
          method: 'PATCH',
          body: formData,
          headers: {
            'x-skip-content-type': 'true',
          },
        };
      },
    }),
    getSelfProfile: builder.query<GetSelfProfileResponse, void>({
      query: () => ({
        url: '/user/self/in',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetSelfProfileQuery,
  useUpdateSelfProfileMutation,
  useChangePasswordMutation,
} = authApi;
