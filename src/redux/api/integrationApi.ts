import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export interface IntegrationItem {
  id?: string | number;
  name?: string;
  type?: string;
  category?: string;
  status?: string;
  isConnected?: boolean;
  description?: string;
  icon?: string;
}

export interface GetIntegrationsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: IntegrationItem[] | { docs: IntegrationItem[] };
  };
}

export interface GetIntegrationOAuthResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      oauthUrl: string;
    };
  };
}

export const integrationApi = createApi({
  reducerPath: 'integrationApi',
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_INTEGRATION_API_BASE_URL ||
      import.meta.env.VITE_AUTH_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
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
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Integrations'],
  endpoints: (builder) => ({
    getIntegrations: builder.query<GetIntegrationsResponse, void>({
      query: () => 'integration',
      providesTags: ['Integrations'],
    }),
    getIntegrationOAuthUrl: builder.query<GetIntegrationOAuthResponse, string>({
      query: (type) => `integration/oauth/${type}`,
    }),
  }),
});

export const { useGetIntegrationsQuery, useLazyGetIntegrationOAuthUrlQuery } = integrationApi;
