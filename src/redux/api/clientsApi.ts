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

interface UpdateClientResponse extends CreateClientResponse {}

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
  useCreateSessionMutation,
  useCreateAppointmentMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useCreateClinicalNoteMutation,
} = clientsApi;
