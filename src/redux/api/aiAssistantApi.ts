import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../store";

export type AiAssistantRole = "user" | "assistant" | "system";

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

export interface AiAssistantDraftEmailRequest {
  clientId: string;
  purpose: string;
  tone: string;
}

export interface AiAssistantDraftEmailResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: {
      message?: string;
      draft?: string;
      email?: string;
      subject?: string;
      body?: string;
    };
  };
}

export interface EnhanceEmailRequest {
  content: string;
  tone?: "professional" | "friendly" | "formal";
  purpose?: string;
}

export interface EnhanceEmailResponse {
  status: number;
  message: string;
  data?: {
    original?: string;
    enhanced?: string;
  };
}

export interface SendEmailRequest {
  clientId: string;
  clinicianId: string;
  content: string;
  subject?: string;
}

export interface SendEmailResponse {
  status: number;
  message: string;
  data?: {
    success?: boolean;
    sentTo?: string;
    clientName?: string;
  };
}

export const aiAssistantApi = createApi({
  reducerPath: "aiAssistantApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const skipContentType = headers.get("x-skip-content-type") === "true";
      if (skipContentType) {
        headers.delete("x-skip-content-type");
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    sendChat: builder.mutation<AiAssistantChatResponse, AiAssistantChatRequest>(
      {
        query: (body) => ({
          url: "/ai-assistant/chat",
          method: "POST",
          body,
        }),
      },
    ),
    draftEmail: builder.mutation<
      AiAssistantDraftEmailResponse,
      AiAssistantDraftEmailRequest
    >({
      query: (body) => ({
        url: "/ai-assistant/draft-email",
        method: "POST",
        body,
      }),
    }),
    enhanceEmail: builder.mutation<EnhanceEmailResponse, EnhanceEmailRequest>({
      query: (body) => ({
        url: "/ai-assistant/enhance-email",
        method: "POST",
        body,
      }),
    }),
    sendEmail: builder.mutation<SendEmailResponse, SendEmailRequest>({
      query: (body) => ({
        url: "/ai-assistant/send-email",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSendChatMutation,
  useDraftEmailMutation,
  useEnhanceEmailMutation,
  useSendEmailMutation,
} = aiAssistantApi;
