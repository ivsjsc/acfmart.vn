import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (!normalizedId.includes('/node_modules/')) return undefined;

          if (normalizedId.includes('/react-router-dom/')) return 'router-vendor';
          if (normalizedId.includes('/@tanstack/react-query/')) return 'query-vendor';
          if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/')) return 'react-vendor';
          if (normalizedId.includes('/firebase/')) return 'firebase-vendor';
          if (normalizedId.includes('/lucide-react/')) return 'ui-vendor';
          if (normalizedId.includes('/@medusajs/')) return 'medusa-vendor';
          if (
            normalizedId.includes('/zod/') ||
            normalizedId.includes('/clsx/') ||
            normalizedId.includes('/tailwind-merge/')
          ) {
            return 'utils-vendor';
          }

          return undefined;
        }
      }
    }
  },
});
