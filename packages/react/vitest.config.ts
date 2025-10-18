import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/__tests__/setup.tsx'],
    globals: true,
    // 针对 React Testing Library 的特殊配置
    threads: false,
    isolate: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});