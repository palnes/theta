import { areTokenValuesEqual, buildNestedStructure } from '../token-helpers.js';

// Constants
const DEFAULT_FILENAME = 'tokens.json';

/**
 * Terrazzo plugin that generates JSON with theme support
 */
export default function jsonPlugin(options = {}) {
  const { filename = DEFAULT_FILENAME, themes = {}, registry } = options;

  // Helper to navigate to a value in theme data
  const getThemeValueByPath = (themeData, path) => {
    let value = themeData;
    for (const part of path) {
      value = value?.[part];
    }
    return value;
  };

  // Helper to build nested override object
  const buildNestedOverride = (overrides, path, value) => {
    let current = overrides;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  };

  // Helper to process theme overrides for a single theme
  const processThemeOverrides = (themeName, themeData, tokens) => {
    if (themeName === 'light') {
      return {}; // Light theme has no overrides
    }

    const overrides = {};

    for (const [id, token] of Object.entries(tokens)) {
      const path = id.split('.');
      const themeValue = getThemeValueByPath(themeData, path);

      if (
        themeValue &&
        themeValue.$value !== undefined &&
        !areTokenValuesEqual(themeValue.$value, token.$value)
      ) {
        buildNestedOverride(overrides, path, themeValue.$value);
      }
    }

    return overrides;
  };

  // Helper to register outputs with registry
  const registerOutputs = (tokens, registry) => {
    if (!registry) return;

    for (const [id, token] of Object.entries(tokens)) {
      registry.registerOutput(id, 'json', {
        name: id,
        value: token.$value,
        usage: id,
      });
    }
  };

  return {
    name: 'json',
    async build({ tokens, outputFile }) {
      // Build nested structure for base tokens
      const nestedTokens = buildNestedStructure(tokens, (token) => token.$value);

      // Build theme overrides
      const themeOverrides = {};
      for (const [themeName, themeData] of Object.entries(themes)) {
        themeOverrides[themeName] = processThemeOverrides(themeName, themeData, tokens);
      }

      // Generate JSON content
      const jsonContent = {
        tokens: nestedTokens,
        themes: themeOverrides,
      };

      await outputFile(filename, JSON.stringify(jsonContent, null, 2));
      console.log('✓ Generated JSON');

      // Register outputs with registry
      registerOutputs(tokens, registry);
    },
  };
}
