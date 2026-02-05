import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export interface FinancialOverviewMonth {
  month: string;
  year: number;
  revenue: number;
  appointmentCount: number;
}

export interface FinancialOverviewData {
  totalIncome: number;
  avgRevenue: number;
  growthRate: number;
  outstanding: number;
  monthlyRevenue: FinancialOverviewMonth[];
  totalAppointments: number;
  scope: string;
}

export interface FinancialOverviewResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: FinancialOverviewData;
  };
}

export interface SessionDistributionBucket {
  count: number;
  percentage: number;
}

export interface SessionDistributionData {
  distribution: {
    individual: SessionDistributionBucket;
    couples: SessionDistributionBucket;
    family: SessionDistributionBucket;
    group: SessionDistributionBucket;
    other?: SessionDistributionBucket;
  };
  totalSessions: number;
  scope: string;
}

export interface SessionDistributionResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: SessionDistributionData;
  };
}

export interface ClientGrowthMonth {
  month: string;
  year: number;
  newClients: number;
  churnedClients: number;
  netGrowth: number;
}

export interface ClientGrowthSummary {
  totalNewClients: number;
  totalChurnedClients: number;
  netGrowth: number;
  activeClients: number;
  churnRate: number;
}

export interface ClientGrowthData {
  monthlyData: ClientGrowthMonth[];
  summary: ClientGrowthSummary;
  scope: string;
}

export interface ClientGrowthResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: ClientGrowthData;
  };
}

export interface ExpensesBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface ExpensesData {
  totalExpenses: number;
  monthlySubscriptionCost: number;
  margin: number;
  breakdown: ExpensesBreakdownItem[];
  scope: string;
}

export interface ExpensesResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: ExpensesData;
  };
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_AUTH_API_BASE_URL,
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
  tagTypes: ['FinancialOverview', 'SessionDistribution', 'ClientGrowth', 'Expenses'],
  endpoints: (builder) => ({
    getFinancialOverview: builder.query<FinancialOverviewResponse, void>({
      query: () => ({
        url: 'analytics/financial-overview',
      }),
      providesTags: ['FinancialOverview'],
    }),
    getSessionDistribution: builder.query<SessionDistributionResponse, void>({
      query: () => ({
        url: 'analytics/session-distribution',
      }),
      providesTags: ['SessionDistribution'],
    }),
    getClientGrowth: builder.query<ClientGrowthResponse, void>({
      query: () => ({
        url: 'analytics/client-growth',
      }),
      providesTags: ['ClientGrowth'],
    }),
    getExpenses: builder.query<ExpensesResponse, void>({
      query: () => ({
        url: 'analytics/expenses',
      }),
      providesTags: ['Expenses'],
    }),
  }),
});

export const {
  useGetFinancialOverviewQuery,
  useGetSessionDistributionQuery,
  useGetClientGrowthQuery,
  useGetExpensesQuery
} = analyticsApi;
