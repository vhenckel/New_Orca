import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

import { getBuildVersion, versionPlugin } from "./src/plugins/version";

const apiTarget =
  process.env.VITE_API_URL ??
  process.env.VITE_ORCA_API_BASE_URL ??
  "http://localhost:3000";

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const release = getBuildVersion();

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    versionPlugin(),
    ...(sentryAuthToken
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: sentryAuthToken,
            release: { name: release },
          }),
        ]
      : []),
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
