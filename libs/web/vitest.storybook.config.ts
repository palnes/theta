import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [
    react(),
    storybookTest({
      configDir: path.join(__dirname, '.storybook'),
      storybookScript: 'yarn storybook --ci',
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  optimizeDeps: {
    include: ['storybook/test', 'react-aria-components'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    name: 'storybook',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts', './.storybook/vitest.setup.ts'],
    includeTaskLocation: true,
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
