import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const upstreamBase =
    env.VITE_DEV_PROXY_TARGET ||
    env.VITE_CLIENTS_API_BASE_URL ||
    env.VITE_AUTH_API_BASE_URL ||
    "";

  let proxyTarget = "";
  try {
    proxyTarget = upstreamBase ? new URL(upstreamBase).origin : "";
  } catch {
    proxyTarget = "";
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: proxyTarget
      ? {
          proxy: {
            "/api/v1": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  };
});
