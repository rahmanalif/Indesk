import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export type AssessmentQuestionType = 'text' | 'multiple_choice' | 'yes_no';

export interface AssessmentQuestionPayload {
  question: string;
  type: AssessmentQuestionType;
  options?: string[];
  points?: number;
  order?: number;
}

export interface AssessmentQuestion extends AssessmentQuestionPayload {
  id?: string;
  templateId?: string;
  correctAnswer?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssessmentTemplateRequest {
  title: string;
  description?: string;
  category: string;
  questions: AssessmentQuestionPayload[];
}

export interface AssessmentTemplate {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  questions?: AssessmentQuestion[];
  _count?: {
    instances?: number;
  };
}

export interface CreateAssessmentTemplateResponse {
  success?: boolean;
  status?: number;
  message?: string;
  response?: {
    data?: AssessmentTemplate;
  };
  data?: AssessmentTemplate;
}

export interface GetAssessmentTemplatesResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: AssessmentTemplate[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface GetAssessmentTemplateByIdResponse {
  success?: boolean;
  status?: number;
  message?: string;
  response?: {
    data?: AssessmentTemplate;
  };
  data?: AssessmentTemplate;
}

export interface GetAssessmentTemplatesParams {
  category?: string;
  limit?: number;
  page?: number;
  sort?: string;
}

export const assessmentApi = createApi({
  reducerPath: 'assessmentApi',
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
  tagTypes: ['AssessmentTemplate'],
  endpoints: (builder) => ({
    getAssessmentTemplates: builder.query<GetAssessmentTemplatesResponse, GetAssessmentTemplatesParams>({
      query: (params) => ({
        url: 'assessment/template',
        params: {
          category: params.category,
          limit: params.limit,
          page: params.page,
          sort: params.sort,
        },
      }),
      providesTags: (result) =>
        result?.response?.data?.docs
          ? [
              ...result.response.data.docs.map((doc) => ({
                type: 'AssessmentTemplate' as const,
                id: doc.id,
              })),
              { type: 'AssessmentTemplate', id: 'LIST' },
            ]
          : [{ type: 'AssessmentTemplate', id: 'LIST' }],
    }),
    getAssessmentTemplateById: builder.query<GetAssessmentTemplateByIdResponse, string>({
      query: (id) => `assessment/template/${id}`,
      providesTags: (result, error, id) => [{ type: 'AssessmentTemplate', id }],
    }),
    createAssessmentTemplate: builder.mutation<CreateAssessmentTemplateResponse, CreateAssessmentTemplateRequest>({
      query: (payload) => ({
        url: 'assessment/template',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AssessmentTemplate', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateAssessmentTemplateMutation,
  useGetAssessmentTemplatesQuery,
  useGetAssessmentTemplateByIdQuery,
} = assessmentApi;
