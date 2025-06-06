import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    name: 'unit',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    includeTaskLocation: true,
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
