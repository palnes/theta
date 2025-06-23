import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';

export default defineConfig({
  tokens: './temp/all-tokens.json',
  outDir: './dist/css',
  plugins: [
    css({
      filename: 'internal-all-tokens.css',
    }),
  ],
});
