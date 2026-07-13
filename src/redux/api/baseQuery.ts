import {
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    if (headers.get("x-skip-content-type") === "true") {
      headers.delete("x-skip-content-type");
    }
    return headers;
  },
});

const publicAuthPaths = new Set([
  "/auth/login",
  "/auth/logout",
  "/auth/register",
  "/auth/verify-account",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-tokens",
]);

const requestUrl = (args: string | FetchArgs) =>
  typeof args === "string" ? args : args.url;

const refreshSession = (api: BaseQueryApi) =>
  Promise.resolve(
    rawBaseQuery(
      { url: "/auth/refresh-tokens", method: "POST", body: {} },
      api,
      {},
    ),
  );

let refreshPromise: ReturnType<typeof refreshSession> | null = null;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401 || publicAuthPaths.has(requestUrl(args))) {
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = refreshSession(api).finally(() => {
      refreshPromise = null;
    });
  }

  const refreshResult = await refreshPromise;
  if (!refreshResult.error) {
    result = await rawBaseQuery(args, api, extraOptions);
  } else if (
    refreshResult.error.status === 401 ||
    refreshResult.error.status === 403
  ) {
    api.dispatch(logout());
  }

  return result;
};
