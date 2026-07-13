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

const refreshSession = async (api: BaseQueryApi) => {
  const refresh = async () => {
    // Another tab may have refreshed while this request waited for the lock.
    const sessionProbe = await rawBaseQuery(
      { url: "/user/self/in", method: "GET" },
      api,
      {},
    );
    if (!sessionProbe.error) {
      return { ok: true, status: undefined };
    }
    if (sessionProbe.error.status !== 401) {
      return { ok: false, status: sessionProbe.error.status };
    }

    const result = await rawBaseQuery(
      { url: "/auth/refresh-tokens", method: "POST", body: {} },
      api,
      {},
    );
    return { ok: !result.error, status: result.error?.status };
  };

  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("indesk-auth-refresh", refresh);
  }
  return refresh();
};

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
  if (refreshResult.ok) {
    result = await rawBaseQuery(args, api, extraOptions);
  } else if (
    refreshResult.status === 401 ||
    refreshResult.status === 403
  ) {
    api.dispatch(logout());
  }

  return result;
};
