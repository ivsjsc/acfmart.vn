import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/types': path.resolve(__dirname, './types'),
      '@repo/ui': path.resolve(__dirname, '../packages/design-system/ui/src'),
      '@/repo/ui/utils': path.resolve(__dirname, '../packages/design-system/ui/src/utils'),
      '@/repo/ui/types': path.resolve(__dirname, '../packages/design-system/ui/src/types'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large libraries into separate chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react'],
          // Remove firebase-vendor from manualChunks to avoid resolution issues
          'medusa-vendor': ['@medusajs/js-sdk'],
          'utils-vendor': ['zod', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
});