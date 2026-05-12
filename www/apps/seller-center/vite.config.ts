import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      exclude: ['fs', 'path'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    port: 3001,  // Different port from customer app
    proxy: {
      '/store': {
        target: 'http://localhost:9000', // Medusa backend
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:9000', // Medusa backend
        changeOrigin: true,
        secure: false,
      },
      '/acf': {
        target: 'http://localhost:9000', // ACF custom endpoints
        changeOrigin: true,
        secure: false,
      }
    },
  },
  build: {
    outDir: './dist',
  },
})