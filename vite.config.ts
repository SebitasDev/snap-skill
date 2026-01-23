import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    exclude: ["x402-client"],
  },
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true,
    proxy: {
      "/api/openmid": {
        target: "https://facilitator.openmid.xyz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openmid/, ""),
      },
      "/api/x402": {
        target: "https://x402-secure-api.t54.ai",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": {},
    global: "window",
  },
}));
