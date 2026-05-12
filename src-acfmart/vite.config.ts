import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'react-native': 'react-native-web',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
    },
  },
  build: {
    outDir: '../../dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-native'],
          navigation: ['@react-navigation/native', '@react-navigation/stack'],
          ui: ['@expo/vector-icons', 'react-native-elements'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-native',
      'react-native-web',
      '@expo/vector-icons',
      '@react-navigation/native',
      '@react-navigation/stack',
    ],
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'react-native': 'react-native-web',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
    },
  },
  build: {
    outDir: '../../dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-native'],
          navigation: ['@react-navigation/native', '@react-navigation/stack'],
          ui: ['@expo/vector-icons', 'react-native-elements'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-native',
      'react-native-web',
      '@expo/vector-icons',
      '@react-navigation/native',
      '@react-navigation/stack',
    ],
  },
});