import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // UI Components - split into smaller chunks
          if (id.includes('@radix-ui')) {
            if (id.includes('dialog') || id.includes('dropdown') || id.includes('select')) {
              return 'ui-core';
            }
            if (id.includes('chart') || id.includes('tooltip') || id.includes('popover')) {
              return 'ui-charts';
            }
            return 'ui-components';
          }
          
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // Charts and visualization - separate chunk for heavy library
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Query management
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          
          // Form handling
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'forms';
          }
          
          // Utilities
          if (id.includes('lucide-react') || id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'utils';
          }
          
          // Large components - separate chunks
          if (id.includes('components/StatsChart') || id.includes('components/AnalyticsKPI')) {
            return 'analytics-components';
          }
          
          if (id.includes('components/Dashboard') || id.includes('components/TourVirtuali')) {
            return 'dashboard-components';
          }
          
          // Default chunk for other modules
          return 'vendor';
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
}));
