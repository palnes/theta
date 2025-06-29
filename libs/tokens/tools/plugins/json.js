import { areTokenValuesEqual, buildNestedStructure } from '../token-helpers.js';

// Constants
const DEFAULT_FILENAME = 'tokens.json';

/**
 * Terrazzo plugin that generates JSON with theme support
 */
export default function jsonPlugin(options = {}) {
  const { filename = DEFAULT_FILENAME, themes = {}, registry } = options;

  return {
    name: 'json',
    async build({ tokens, outputFile }) {
      // Build nested structure for base tokens
      const nestedTokens = buildNestedStructure(tokens, (token) => token.$value);

      // Build theme overrides
      const themeOverrides = {};

      for (const [themeName, themeData] of Object.entries(themes)) {
        if (themeName === 'light') {
          themeOverrides[themeName] = {}; // Light theme has no overrides
          continue;
        }

        const overrides = {};

        // Find overridden tokens
        for (const [id, token] of Object.entries(tokens)) {
          const path = id.split('.');
          let themeValue = themeData;

          // Navigate to value in theme
          for (const part of path) {
            themeValue = themeValue?.[part];
          }

          if (
            themeValue &&
            themeValue.$value !== undefined &&
            !areTokenValuesEqual(themeValue.$value, token.$value)
          ) {
            // Build nested path for override
            let current = overrides;
            for (let i = 0; i < path.length - 1; i++) {
              if (!current[path[i]]) {
                current[path[i]] = {};
              }
              current = current[path[i]];
            }
            current[path[path.length - 1]] = themeValue.$value;
          }
        }

        themeOverrides[themeName] = overrides;
      }

      // Generate JSON content
      const jsonContent = {
        tokens: nestedTokens,
        themes: themeOverrides,
      };

      await outputFile(filename, JSON.stringify(jsonContent, null, 2));
      console.log('✓ Generated JSON');

      // Register outputs with registry if provided
      if (registry) {
        for (const [id, token] of Object.entries(tokens)) {
          registry.registerOutput(id, 'json', {
            name: id,
            value: token.$value,
            usage: id,
          });
        }
      }
    },
  };
}
