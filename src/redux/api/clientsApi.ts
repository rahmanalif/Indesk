// src/services/clientsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

interface ClientAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ClientNote {
  id: string;
  clientId: string;
  authorId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
}

export interface ClientAppointment {
  id: string;
  clinicId: string;
  clinicianId: string | null;
  addedBy: string | null;
  clientId: string;
  sessionId: string | null;
  status: string;
  startTime: string | null;
  endTime: string | null;
  note: string | null;
  meetingType: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  zoomMeetingId: string | null;
  googleCalendarEventId: string | null;
  appointmentToken: string | null;
  transactionId: string | null;
  invoiceId: string | null;
  via: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionType {
  id: string;
  clinicId: string;
  name: string;
  duration: number;
  description: string | null;
  price: number | null;
  color: string | null;
  reminders: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetClientAppointmentsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: ClientAppointment[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface GetSessionsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: SessionType[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface InvoiceItemSession {
  name: string;
  price: number;
}

export interface InvoiceAppointment {
  id: string;
  startTime: string;
  session: InvoiceItemSession | null;
}

export interface InvoiceClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clinicId: string;
  items: any[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: string;
  invoiceDate: string;
  dueDate: string;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
  client: InvoiceClient | null;
  appointments: InvoiceAppointment[];
}

export interface GetInvoicesResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: Invoice[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface ClinicMember {
  id: string;
  userId: string;
  clinicId: string;
  role: string;
  clinicianToken?: string | null;
  availability?: string[] | null;
  specialization?: string[] | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

export interface GetClinicMembersResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: ClinicMember[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface ClinicPermissions {
  [key: string]: boolean;
}

export interface ClinicMemberUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phoneNumber?: string | null;
  countryCode?: string | null;
  bio?: string | null;
  role?: string | null;
}

export interface ClinicMemberItem {
  id: string;
  userId: string;
  clinicId: string;
  role: string;
  clinicianToken?: string | null;
  availability?: string[] | null;
  specialization?: string[] | null;
  createdAt: string;
  updatedAt: string;
  user?: ClinicMemberUser | null;
}

export interface ClinicOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phoneNumber?: string | null;
  countryCode?: string | null;
}

export interface ClinicDetails {
  id: string;
  name: string;
  email: string;
  url?: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  address: Record<string, any>;
  logo: string | null;
  color: string | null;
  description: string | null;
  permissions: ClinicPermissions;
  publicToken: string | null;
  isActive: boolean;
  activatedAt: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members?: ClinicMemberItem[];
  owner?: ClinicOwner | null;
}

export interface GetClinicResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: ClinicDetails;
  };
}

export interface PatchClinicPermissionsResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: ClinicDetails;
  };
}

export interface UpdateClinicResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: ClinicDetails;
  };
}

export interface UpdateClinicAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface UpdateClinicRequest {
  name: string;
  email: string;
  color?: string;
  phoneNumber?: string;
  countryCode?: string;
  url?: string;
  address?: UpdateClinicAddress;
  logo?: File | null;
}

export interface InvoiceStatsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      monthlySales: {
        amount: number;
        count: number;
      };
      dueAmount: {
        amount: number;
        count: number;
      };
      overdueAmount: {
        amount: number;
        count: number;
      };
    };
  };
}

export interface SubscriptionPlanFeatures {
  notes?: boolean;
  clients?: boolean;
  assessments?: boolean;
  appointments?: boolean;
  integrations?: boolean;
  custom_branding?: boolean;
  priority_support?: boolean;
  advanced_reporting?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  price: number;
  clientLimit?: number | null;
  features?: SubscriptionPlanFeatures;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionClinic {
  id: string;
  name: string;
  email: string;
}

export interface Subscription {
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
  plan?: SubscriptionPlan;
  clinic?: SubscriptionClinic;
}

export interface SubscriptionUsage {
  canAddClient: boolean;
  currentCount: number;
  limit: number;
  isUnlimited: boolean;
  planName: string;
  planType: string;
  subscriptionStatus: string;
}

export interface GetCurrentSubscriptionResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      subscription: Subscription;
      usage: SubscriptionUsage;
    };
  };
}

export interface ClinicTransactionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ClinicTransaction {
  id: string;
  sessionId: string | null;
  clientId: string | null;
  clinicId: string;
  userId: string;
  transactionId: string;
  amount: number;
  type: string;
  method: string;
  status: string;
  description: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  client?: any | null;
  session?: any | null;
  user?: ClinicTransactionUser | null;
}

export interface GetClinicTransactionsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: ClinicTransaction[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}
export interface CreateInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateInvoiceRequest {
  clientId: string;
  items: CreateInvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  invoiceDate: string;
}

interface CreateInvoiceResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: Invoice;
  };
}

export interface CreateSessionRequest {
  name: string;
  description?: string | null;
  duration: number;
  price: number;
}

interface CreateSessionResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: SessionType;
  };
}

export interface CreateAppointmentRequest {
  sessionId: string;
  clientId: string;
  clinicianId: string;
  date: string;
  time: string;
  note?: string | null;
  meetingType?: string | null;
}

interface CreateAppointmentResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: ClientAppointment;
  };
}

export interface CreateClinicMemberRequest {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  countryCode?: string;
  bio?: string;
  specialization?: string[];
  availability?: string[];
}

export interface UpdateClinicMemberRequest {
  memberId: string;
  availability?: string[];
  specialization?: string[];
}

export interface UpdateClinicMemberRoleRequest {
  memberId: string;
  role: string;
}

interface ClinicMemberMutationResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: ClinicMemberItem;
  };
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string;
  countryCode?: string;
  status?: 'active' | 'waiting' | 'inactive';
  clinicId: string;
  assignedClinicianId?: string | null;
  address?: ClientAddress | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  insuranceAuthorizationNumber?: string | null;
  note?: string | null;
}

export interface UpdateClientRequest {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  countryCode?: string | null;
  status?: 'active' | 'waiting' | 'inactive';
  assignedClinicianId?: string | null;
  address?: ClientAddress | null;
}

interface CreateClientResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      dateOfBirth: string | null;
      gender: string | null;
      phoneNumber: string | null;
      countryCode: string | null;
      address: ClientAddress | null;
      insuranceProvider: string | null;
      insuranceNumber: string | null;
      insuranceAuthorizationNumber: string | null;
      note: string | null;
      status: string;
      assignedClinicianId: string | null;
      clinicId: string;
      addedBy: string;
      createdAt: string;
      updatedAt: string;
      userId: string | null;
      clinicMemberId: string | null;
    };
  };
}

export interface GetClientByIdResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      dateOfBirth: string | null;
      gender: string | null;
      phoneNumber: string | null;
      countryCode: string | null;
      address: ClientAddress | null;
      insuranceProvider: string | null;
      insuranceNumber: string | null;
      insuranceAuthorizationNumber: string | null;
      note: string | null;
      status: string;
      assignedClinicianId: string | null;
      clinicId: string;
      addedBy: string;
      createdAt: string;
      updatedAt: string;
      userId: string | null;
      clinicMemberId: string | null;
      notes: ClientNote[];
    };
  };
}

type UpdateClientResponse = CreateClientResponse;

export interface CreateClinicalNoteRequest {
  clientId: string;
  note: string;
}

interface CreateClinicalNoteResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: ClientNote;
  };
}

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_CLIENTS_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const skipContentType = headers.get('x-skip-content-type') === 'true';
      if (skipContentType) {
        headers.delete('x-skip-content-type');
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
      if (!skipContentType) {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['Clients'],
  endpoints: (builder) => ({
    getClients: builder.query({
      query: (params: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
      }) => ({
        url: '/client',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status,
          search: params.search,
        },
      }),
      providesTags: ['Clients'],
    }),
    
    createClient: builder.mutation<CreateClientResponse, CreateClientRequest>({
      query: (clientData) => ({
        url: '/client',
        method: 'POST',
        body: clientData,
      }),
      invalidatesTags: ['Clients'],
    }),
    
    getClientById: builder.query<GetClientByIdResponse, string>({
      query: (id) => `/client/${id}`,
      providesTags: (result, error, id) => [{ type: 'Clients', id }],
    }),

    getClientAppointments: builder.query<GetClientAppointmentsResponse, string>({
      query: (clientId) => `/appointment/client/${clientId}`,
      providesTags: (result, error, clientId) => [{ type: 'Clients', id: clientId }],
    }),

    getSessions: builder.query<GetSessionsResponse, void>({
      query: () => `/session`,
      providesTags: ['Clients'],
    }),

    getInvoices: builder.query<GetInvoicesResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/invoice',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }),
      providesTags: ['Clients'],
    }),

    getInvoiceStats: builder.query<InvoiceStatsResponse, void>({
      query: () => '/invoice/stats',
      providesTags: ['Clients'],
    }),

    getCurrentSubscription: builder.query<GetCurrentSubscriptionResponse, void>({
      query: () => '/subscription/current',
      providesTags: ['Clients'],
    }),

    getClinicTransactions: builder.query<GetClinicTransactionsResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/transaction/clinic',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 50,
        },
      }),
      providesTags: ['Clients'],
    }),

    getClinicMembers: builder.query<GetClinicMembersResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/clinic-member',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }),
      providesTags: ['Clients'],
    }),

    getClinic: builder.query<GetClinicResponse, void>({
      query: () => '/clinic',
      providesTags: ['Clients'],
    }),

    patchClinicPermissions: builder.mutation<PatchClinicPermissionsResponse, ClinicPermissions>({
      query: (body) => ({
        url: '/clinic/permissions',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    updateClinic: builder.mutation<UpdateClinicResponse, UpdateClinicRequest>({
      query: ({ logo, ...body }) => {
        if (logo) {
          const formData = new FormData();
          formData.append('name', body.name);
          formData.append('email', body.email);
          if (body.color) formData.append('color', body.color);
          if (body.phoneNumber) formData.append('phoneNumber', body.phoneNumber);
          if (body.countryCode) formData.append('countryCode', body.countryCode);
          if (body.url) formData.append('url', body.url);
          if (body.address) formData.append('address', JSON.stringify(body.address));
          formData.append('logo', logo);

          return {
            url: '/clinic',
            method: 'PUT',
            body: formData,
            headers: {
              'x-skip-content-type': 'true',
            },
          };
        }

        return {
          url: '/clinic',
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Clients'],
    }),

    createInvoice: builder.mutation<CreateInvoiceResponse, CreateInvoiceRequest>({
      query: (body) => ({
        url: '/invoice',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    createSession: builder.mutation<CreateSessionResponse, CreateSessionRequest>({
      query: (body) => ({
        url: '/session',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    createAppointment: builder.mutation<CreateAppointmentResponse, CreateAppointmentRequest>({
      query: (body) => ({
        url: '/appointment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    createClinicMember: builder.mutation<ClinicMemberMutationResponse, CreateClinicMemberRequest>({
      query: (body) => ({
        url: '/clinic-member',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    updateClinicMember: builder.mutation<ClinicMemberMutationResponse, UpdateClinicMemberRequest>({
      query: ({ memberId, ...body }) => ({
        url: `/clinic-members/${memberId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    updateClinicMemberRole: builder.mutation<ClinicMemberMutationResponse, UpdateClinicMemberRoleRequest>({
      query: ({ memberId, role }) => ({
        url: `/clinic-members/${memberId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Clients'],
    }),
    
    updateClient: builder.mutation<UpdateClientResponse, UpdateClientRequest>({
      query: ({ clientId, ...body }) => ({
        url: `/client/${clientId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { clientId }) => [{ type: 'Clients', id: clientId }, 'Clients'],
    }),
    
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/client/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),

    createClinicalNote: builder.mutation<CreateClinicalNoteResponse, CreateClinicalNoteRequest>({
      query: (body) => ({
        url: '/clinical-note',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { clientId }) => [{ type: 'Clients', id: clientId }],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useGetClientByIdQuery,
  useGetClientAppointmentsQuery,
  useGetSessionsQuery,
  useGetInvoicesQuery,
  useGetInvoiceStatsQuery,
  useGetCurrentSubscriptionQuery,
  useGetClinicTransactionsQuery,
  useGetClinicMembersQuery,
  useGetClinicQuery,
  usePatchClinicPermissionsMutation,
  useUpdateClinicMutation,
  useCreateInvoiceMutation,
  useCreateSessionMutation,
  useCreateAppointmentMutation,
  useCreateClinicMemberMutation,
  useUpdateClinicMemberMutation,
  useUpdateClinicMemberRoleMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useCreateClinicalNoteMutation,
} = clientsApi;
