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
    
    updateClient: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/client/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Clients', id }, 'Clients'],
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
  useUpdateClientMutation,
  useDeleteClientMutation,
  useCreateClinicalNoteMutation,
} = clientsApi;
