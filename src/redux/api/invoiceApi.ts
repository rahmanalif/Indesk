import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth: string | null;
  gender: string;
  address: ClientAddress | null;
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  status: string;
  assignedClinicianId: string | null;
  clinicId: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  assignedClinician?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
  appointments?: any[];
  notes?: any[];
}

export interface Appointment {
  id: string;
  clinicId: string;
  clinicianId: string;
  clientId: string;
  sessionId: string;
  status: string;
  startTime: string;
  endTime: string;
  note?: string;
  meetingType: string;
  invoiceId: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  session: {
    name: string;
    duration: number;
    price: number;
  };
  clinician: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string;
    };
  };
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  appointmentId?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clinicId: string;
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'sent' | string;
  issueDate: string;
  dueDate: string;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
  client: Client | null;
  appointments: Appointment[];
  notes?: string;
}

export interface InvoiceResponse {
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

export interface InvoiceParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
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

export interface ClientsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: Client[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface ClientParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AppointmentsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: Appointment[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface CreateInvoiceData {
  clientId: string;
  appointmentIds: string[];
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  issueDate: string;
  notes?: string;
  status?: string;
}

export interface AppointmentParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
}

export const invoiceApi = createApi({
  reducerPath: 'invoiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_AUTH_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    getInvoices: builder.query<InvoiceResponse, InvoiceParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status && params.status !== 'All') queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        return `invoice?${queryParams.toString()}`;
      },
      providesTags: ['Invoice'],
    }),

    getInvoiceById: builder.query<Invoice, string>({
      query: (id) => `invoice/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),

    getInvoiceStats: builder.query<InvoiceStatsResponse, void>({
      query: () => 'invoice/stats',
      providesTags: ['Invoice'],
    }),

    getAppointments: builder.query<AppointmentsResponse, AppointmentParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.clientId) queryParams.append('clientId', params.clientId);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        return `appointment?${queryParams.toString()}`;
      },
      providesTags: ['Invoice'],
    }),

    createInvoice: builder.mutation<Invoice, CreateInvoiceData>({
      query: (newInvoice) => ({
        url: 'invoice',
        method: 'POST',
        body: newInvoice,
      }),
      invalidatesTags: ['Invoice'],
    }),

    getClients: builder.query<ClientsResponse, ClientParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);

        return `client?${queryParams.toString()}`;
      },
      providesTags: ['Invoice'],
    }),

    updateInvoice: builder.mutation<Invoice, { id: string; data: Partial<Invoice> }>(
      {
        query: ({ id, data }) => ({
          url: `invoice/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['Invoice'],
      }
    ),

    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `invoice/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoice'],
    }),

    sendInvoice: builder.mutation<void, { id: string; email: string }>({
      query: ({ id, email }) => ({
        url: `invoice/${id}/send`,
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetClientsQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useGetAppointmentsQuery,
  useGetInvoiceStatsQuery,
  useDeleteInvoiceMutation,
  useSendInvoiceMutation,
} = invoiceApi;
