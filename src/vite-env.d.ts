/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENABLED?: string;
  readonly VITE_SENTRY_VISIBILITY_MODE?: "verbose" | "normal";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
