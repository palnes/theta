import { typeHandlers } from '../formatters/type-handlers.js';
import { toCamelCase } from '../formatters/utils.js';

// Constants
const DEFAULT_FILENAME = 'tokens.ts';

/**
 * Terrazzo plugin that generates TypeScript with theme support
 */
export default function typescriptPlugin(options = {}) {
  const { filename = DEFAULT_FILENAME, themes = {} } = options;

  return {
    name: 'typescript',
    async build({ tokens, outputFile }) {
      // Build base tokens
      const baseTokens = {};

      for (const [id, token] of Object.entries(tokens)) {
        const value = token.$value;
        const camelCaseKey = toCamelCase(id);
        const handler = typeHandlers[token.$type] ?? ((v) => v);
        baseTokens[camelCaseKey] = handler(value);
      }

      // Build theme overrides
      const themeOverrides = {};

      for (const [themeName, themeTokens] of Object.entries(themes)) {
        themeOverrides[themeName] = {};

        // Only include tokens that differ from base
        for (const [id, themeToken] of Object.entries(themeTokens)) {
          const baseToken = tokens[id];

          if (
            !baseToken ||
            JSON.stringify(themeToken.$value) !== JSON.stringify(baseToken.$value)
          ) {
            const camelCaseKey = toCamelCase(id);
            const handler = typeHandlers[themeToken.$type || baseToken?.$type] ?? ((v) => v);
            themeOverrides[themeName][camelCaseKey] = handler(themeToken.$value);
          }
        }
      }

      // Generate TypeScript content
      const tsContent = `/**
 * Do not edit directly, this file was auto-generated.
 */

export const tokens = ${JSON.stringify(baseTokens, null, 2)} as const;

export const themes = {
${Object.entries(themeOverrides)
  .map(([theme, overrides]) => `  ${theme}: ${JSON.stringify(overrides, null, 2)}`)
  .join(',\n')}
} as const;

export type Theme = keyof typeof themes | 'light';

export function getTokens<T extends Theme = 'light'>(theme?: T): T extends keyof typeof themes ? typeof tokens & typeof themes[T] : typeof tokens {
  return { ...tokens, ...(themes[theme as keyof typeof themes] || {}) } as any;
}

export default tokens;
`;

      await outputFile(filename, tsContent);
      console.log('✓ Generated TypeScript');
    },
  };
}
