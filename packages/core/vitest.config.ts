/**
 * Vitest 配置文件 - 核心包测试
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'dist/',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
});
