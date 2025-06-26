import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

async function getComponentEntries() {
  const componentsDir = resolve(__dirname, 'src/components');
  const entries: Record<string, string> = {};

  try {
    const items = await readdir(componentsDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        const indexPath = resolve(componentsDir, item.name, 'index.ts');
        entries[`components/${item.name}/index`] = indexPath;
      }
    }
  } catch {}

  return entries;
}

export default defineConfig(async () => {
  const componentEntries = await getComponentEntries();

  return {
    plugins: [react()],
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
    },
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          ...componentEntries,
        },
        formats: ['es'],
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react-aria-components'
        ],
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          assetFileNames: ({ name }) => {
            // Keep CSS modules next to their components
            if (name?.endsWith('.css')) {
              return name.replace('.module', '');
            }
            return 'assets/[name][extname]';
          },
        },
      },
      cssCodeSplit: true,
    },
  };
});
