import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface IntegrationItem {
  id?: string | number;
  name?: string;
  type?: string;
  category?: string;
  status?: string;
  isConnected?: boolean;
  isConfigured?: boolean;
  requiresOAuth?: boolean;
  oauthUrl?: string;
  healthStatus?: string | null;
  lastHealthCheck?: string | null;
  requiredEnvVars?: string[];
  documentation?: string;
  description?: string;
  icon?: string;
}

export interface IntegrationDocumentation {
  overview: string;
  add: string[];
  use: string[];
  remove: string[];
}

export interface PublicIntegrationItem {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requiresOAuth: boolean;
  availability: string;
  comingSoonMessage?: string | null;
  documentation?: IntegrationDocumentation | null;
}

export interface GetIntegrationsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: IntegrationItem[] | { docs: IntegrationItem[] };
  };
}

export interface GetPublicIntegrationsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: PublicIntegrationItem[];
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

export interface IntegrationActionResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: Record<string, unknown>;
  };
}

export const integrationApi = createApi({
  reducerPath: "integrationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Integrations"],
  endpoints: (builder) => ({
    getIntegrations: builder.query<GetIntegrationsResponse, void>({
      query: () => "integration",
      providesTags: ["Integrations"],
    }),
    getPublicIntegrations: builder.query<GetPublicIntegrationsResponse, void>({
      query: () => "integration/public",
    }),
    getIntegrationOAuthUrl: builder.query<GetIntegrationOAuthResponse, string>({
      query: (type) => `integration/oauth/${type}`,
    }),
    disconnectIntegration: builder.mutation<IntegrationActionResponse, string>({
      query: (type) => ({
        url: `integration/${type}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Integrations"],
    }),
    checkIntegrationHealth: builder.query<IntegrationActionResponse, string>({
      query: (type) => `integration/${type}/health`,
    }),
  }),
});

export const {
  useGetIntegrationsQuery,
  useGetPublicIntegrationsQuery,
  useLazyGetIntegrationOAuthUrlQuery,
  useDisconnectIntegrationMutation,
  useLazyCheckIntegrationHealthQuery,
} = integrationApi;
