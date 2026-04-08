/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_BASE_URL: string;
  readonly VITE_CLIENTS_API_BASE_URL: string;
  readonly VITE_AI_ASSISTANT_API_BASE_URL?: string;
  readonly VITE_INTEGRATION_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
