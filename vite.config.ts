import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const spotApiTarget =
  process.env.VITE_SPOT_API_BASE_URL ?? "https://spot-api-management.dev.o2obots.com";

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
        target: spotApiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
