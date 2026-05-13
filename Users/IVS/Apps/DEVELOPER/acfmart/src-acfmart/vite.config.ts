import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // 确保基础路径为根目录
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});