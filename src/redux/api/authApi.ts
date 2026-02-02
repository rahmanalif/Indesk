import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_AUTH_API_BASE_URL,
    prepareHeaders: (headers) => {
      // You can add authorization headers here if needed
      headers.set('Content-Type', 'application/json');
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
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
