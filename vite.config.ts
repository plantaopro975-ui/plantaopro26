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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-scroll-area",
          ],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-forms": ["react-hook-form", "zod", "@hookform/resolvers"],
          "vendor-icons": ["lucide-react"],
          "vendor-date": ["date-fns"],
          charts: ["recharts"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["recharts"],
  },
}));
