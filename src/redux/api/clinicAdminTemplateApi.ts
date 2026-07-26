import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export type ClinicAdminTemplateCategory =
  | 'agreement'
  | 'consent'
  | 'intake'
  | 'feedback'
  | 'letter'
  | 'admin';

export type ClinicAdminTemplate = {
  id: string;
  clinicId: string | null;
  title: string;
  category: ClinicAdminTemplateCategory | string;
  description: string | null;
  content: string;
  status: 'active' | 'archived' | string;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  isSystemTemplate?: boolean;
};

export type ClinicAdminSendRecipient = {
  id: string;
  name: string;
  email: string;
  role?: string;
  type?: 'clinician' | 'client';
};

interface ApiEnvelope<T> {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: T;
  };
}

export const clinicAdminTemplateApi = createApi({
  reducerPath: 'clinicAdminTemplateApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ClinicAdminTemplates', 'ClinicAdminSends'],
  endpoints: (builder) => ({
    getClinicAdminTemplates: builder.query<
      ApiEnvelope<ClinicAdminTemplate[]>,
      { category?: string; status?: string; search?: string } | void
    >({
      query: (params) => ({
        url: '/clinic-admin-template',
        params: params || undefined,
      }),
      providesTags: ['ClinicAdminTemplates'],
    }),
    createClinicAdminTemplate: builder.mutation<
      ApiEnvelope<ClinicAdminTemplate>,
      {
        title: string;
        category: string;
        description?: string | null;
        content: string;
        status?: string;
        isGlobal?: boolean;
      }
    >({
      query: (body) => ({
        url: '/clinic-admin-template',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ClinicAdminTemplates'],
    }),
    updateClinicAdminTemplate: builder.mutation<
      ApiEnvelope<ClinicAdminTemplate>,
      {
        templateId: string;
        title?: string;
        category?: string;
        description?: string | null;
        content?: string;
        status?: string;
      }
    >({
      query: ({ templateId, ...body }) => ({
        url: `/clinic-admin-template/${templateId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ClinicAdminTemplates'],
    }),
    copyClinicAdminTemplate: builder.mutation<
      ApiEnvelope<ClinicAdminTemplate>,
      string
    >({
      query: (templateId) => ({
        url: `/clinic-admin-template/${templateId}/copy`,
        method: 'POST',
      }),
      invalidatesTags: ['ClinicAdminTemplates'],
    }),
    updateClinicAdminTemplateStatus: builder.mutation<
      ApiEnvelope<ClinicAdminTemplate>,
      { templateId: string; status: 'active' | 'archived' }
    >({
      query: ({ templateId, status }) => ({
        url: `/clinic-admin-template/${templateId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['ClinicAdminTemplates'],
    }),
    deleteClinicAdminTemplate: builder.mutation<
      ApiEnvelope<{ id: string }>,
      string
    >({
      query: (templateId) => ({
        url: `/clinic-admin-template/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClinicAdminTemplates'],
    }),
    sendClinicAdminTemplate: builder.mutation<
      ApiEnvelope<{
        successCount: number;
        failureCount: number;
        failures: Array<{ email: string; error: string }>;
      }>,
      {
        templateId: string;
        subject: string;
        body: string;
        recipients: ClinicAdminSendRecipient[];
      }
    >({
      query: ({ templateId, ...body }) => ({
        url: `/clinic-admin-template/${templateId}/send`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ClinicAdminSends'],
    }),
  }),
});

export const {
  useGetClinicAdminTemplatesQuery,
  useCreateClinicAdminTemplateMutation,
  useUpdateClinicAdminTemplateMutation,
  useCopyClinicAdminTemplateMutation,
  useUpdateClinicAdminTemplateStatusMutation,
  useDeleteClinicAdminTemplateMutation,
  useSendClinicAdminTemplateMutation,
} = clinicAdminTemplateApi;
