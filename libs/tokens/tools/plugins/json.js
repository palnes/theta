// Constants
const DEFAULT_FILENAME = 'tokens.json';

/**
 * Terrazzo plugin that generates JSON with theme support
 */
export default function jsonPlugin(options = {}) {
  const { filename = DEFAULT_FILENAME, themes = {} } = options;

  return {
    name: 'json',
    async build({ tokens, outputFile }) {
      // Build nested structure for base tokens
      const nestedTokens = {};

      for (const [id, token] of Object.entries(tokens)) {
        const parts = id.split('.');
        let current = nestedTokens;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = token.$value;
      }

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
            JSON.stringify(themeValue.$value) !== JSON.stringify(token.$value)
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
    },
  };
}
