import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // Alterado para '/' para evitar problemas de caminhos no seu domínio .app.br
  base: "/",
  server: {
    host: "::",
    port: 8080,
    // Esta linha abaixo resolve o erro "Blocked Host" do CodeSandbox
    allowedHosts: [".csb.app", "ym5d62-4173.csb.app"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2018",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["recharts"],
  },
}));
