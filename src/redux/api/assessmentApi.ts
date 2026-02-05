import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export type AssessmentQuestionType = 'text' | 'checkbox' | 'multiple_choice';

export interface AssessmentQuestionPayload {
  question: string;
  type: AssessmentQuestionType;
  options?: string[];
}

export interface CreateAssessmentTemplateRequest {
  title: string;
  description?: string;
  questions: AssessmentQuestionPayload[];
}

export interface AssessmentTemplate {
  id?: string;
  title: string;
  description?: string;
  questions: AssessmentQuestionPayload[];
  createdAt?: string;
  updatedAt?: string;
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
    createAssessmentTemplate: builder.mutation<CreateAssessmentTemplateResponse, CreateAssessmentTemplateRequest>({
      query: (payload) => ({
        url: 'assessment/template',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['AssessmentTemplate'],
    }),
  }),
});

export const { useCreateAssessmentTemplateMutation } = assessmentApi;
