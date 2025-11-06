import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: mode === "development" ? {
    host: "127.0.0.1",
    port: 8084,
    https: {
      // Use manually generated certificates to avoid sudo prompt
      key: fs.readFileSync("/Users/fraserbrown/.vite-plugin-mkcert/dev.pem"),
      cert: fs.readFileSync("/Users/fraserbrown/.vite-plugin-mkcert/cert.pem"),
    },
  } : undefined,
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
