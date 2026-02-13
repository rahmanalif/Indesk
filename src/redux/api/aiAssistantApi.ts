import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export type AiAssistantRole = 'user' | 'assistant' | 'system';

export interface AiAssistantMessage {
  role: AiAssistantRole;
  content: string;
}

export interface AiAssistantChatRequest {
  message: string;
  conversationHistory?: AiAssistantMessage[];
}

export interface AiAssistantChatResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      message: string;
      conversationHistory?: AiAssistantMessage[];
    };
  };
}

export const aiAssistantApi = createApi({
  reducerPath: 'aiAssistantApi',
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_AI_ASSISTANT_API_BASE_URL ||
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
  endpoints: (builder) => ({
    sendChat: builder.mutation<AiAssistantChatResponse, AiAssistantChatRequest>({
      query: (body) => ({
        url: '/ai-assistant/chat',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSendChatMutation } = aiAssistantApi;
