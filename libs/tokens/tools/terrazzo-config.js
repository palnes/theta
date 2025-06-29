/**
 * Configuration factory utilities
 */

import { defineConfig } from '@terrazzo/parser';
import cssModularPlugin from './plugins/css-modular.js';
import cssTypesPlugin from './plugins/css-types.js';
import docsPlugin from './plugins/docs.js';
import jsonPlugin from './plugins/json.js';
import typescriptNativePlugin from './plugins/typescript-native.js';
// Registry adapter no longer needed - plugins register directly

// Constants
export const DIST_DIR = 'dist';
export const TEMP_DIR = '.tmp';
export const DEFAULT_THEME = 'light';
export const LOG_LEVEL = 'error';

/**
 * Create Terrazzo configuration
 * @param {string} rootDir - Root directory path
 * @param {Object} options - Configuration options
 * @param {boolean} [options.parse] - Whether this is for parsing (includes lint rules)
 * @param {Array} [options.plugins] - Array of plugins for build
 * @returns {Object} Terrazzo configuration object
 */
export function createConfig(rootDir, options = {}) {
  const baseConfig = {
    tokens: `${TEMP_DIR}/all-tokens.json`,
    outDir: `./${DIST_DIR}`,
  };

  // Parse config includes lint rules and settings
  if (options.parse) {
    return defineConfig(
      {
        ...baseConfig,
        plugins: [],
        ignore: {
          tokens: [],
          deprecated: false,
        },
        logLevel: LOG_LEVEL,
        noExit: true,
      },
      { cwd: new URL(`file:///${rootDir}/`) }
    );
  }

  // Build config just needs plugins
  return defineConfig(
    {
      ...baseConfig,
      plugins: options.plugins || [],
    },
    { cwd: new URL(`file:///${rootDir}/`) }
  );
}

/**
 * Create plugin configuration
 *
 * ADD NEW PLUGINS HERE
 * Each plugin generates different output formats:
 * - cssModularPlugin: CSS files (base.css, components/*.css, themes/*.css)
 * - typescriptNativePlugin: React Native TypeScript tokens
 * - jsonPlugin: JSON token export
 * - docsPlugin: Storybook documentation file
 * - cssTypesPlugin: TypeScript definitions for CSS modules
 *
 * @param {Object} registry - Token registry instance
 * @param {Object} themes - Theme tokens (e.g., { dark: {...} })
 * @returns {Array} Array of configured plugins
 */
export function createPlugins(registry, themes) {
  return [
    // Plugins that use registry
    cssModularPlugin({ themes, registry }),
    typescriptNativePlugin({
      filename: `../${TEMP_DIR}/tokens.ts`,
      themes,
      registry,
    }),
    jsonPlugin({
      filename: 'tokens.json',
      themes,
      registry,
    }),
    docsPlugin({ registry }),

    // Plugins that don't use registry
    cssTypesPlugin({ filename: 'css.d.ts' }),
  ];
}
