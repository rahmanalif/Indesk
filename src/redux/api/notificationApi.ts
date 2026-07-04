import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../store";

export interface NotificationItem {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  message?: string;
  body?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetNotificationsResponse {
  success?: boolean;
  status?: number;
  message?: string;
  response?: {
    data?: NotificationItem[];
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  };
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface GetUnreadCountResponse {
  success?: boolean;
  status?: number;
  message?: string;
  response?: {
    data?: {
      count?: number;
    };
  };
}

export interface MarkAllReadResponse {
  success?: boolean;
  status?: number;
  message?: string;
}

export interface MarkAsReadResponse {
  success?: boolean;
  status?: number;
  message?: string;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
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
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      GetNotificationsResponse,
      GetNotificationsParams
    >({
      query: (params) => ({
        url: "/notification",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
        },
      }),
      providesTags: [{ type: "Notifications", id: "LIST" }],
    }),
    getUnreadCount: builder.query<GetUnreadCountResponse, void>({
      query: () => "/notification/unread-count",
      providesTags: [{ type: "Notifications", id: "UNREAD_COUNT" }],
    }),
    markAllAsRead: builder.mutation<MarkAllReadResponse, void>({
      query: () => ({
        url: "/notification/read-all",
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "UNREAD_COUNT" },
      ],
    }),
    markAsRead: builder.mutation<MarkAsReadResponse, string>({
      query: (notificationId) => ({
        url: `/notification/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "UNREAD_COUNT" },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} = notificationApi;
