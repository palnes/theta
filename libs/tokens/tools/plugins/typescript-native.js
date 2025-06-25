import { typeHandlers } from '../formatters/type-handlers.js';
import { toCamelCase } from '../formatters/utils.js';

// Constants
const DEFAULT_FILENAME = 'tokens.native.ts';

/**
 * Transform tokens for React Native compatibility
 */
function transformForNative(value, type, key) {
  // Handle font family arrays (even in reference tokens)
  if (key?.toLowerCase().includes('fontfamily') && Array.isArray(value)) {
    return value[0];
  }

  // Handle typography tokens
  if (type === 'typography' && typeof value === 'object') {
    return {
      ...value,
      // Convert font family array to string
      fontFamily: Array.isArray(value.fontFamily) ? value.fontFamily[0] : value.fontFamily,
      // Convert font weight to string
      fontWeight: value.fontWeight ? String(value.fontWeight) : undefined,
    };
  }

  // Handle shadow tokens - remove web-specific properties
  if (type === 'shadow' && typeof value === 'object') {
    const { boxShadow, ...nativeShadow } = value;
    return nativeShadow;
  }

  // Handle dimension tokens that might have units
  if (type === 'dimension' && typeof value === 'string' && value.endsWith('px')) {
    return Number.parseInt(value, 10);
  }

  // Handle font weight numbers (convert to string)
  if (key?.toLowerCase().includes('fontweight') && typeof value === 'number') {
    return String(value);
  }

  return value;
}

/**
 * Terrazzo plugin that generates React Native compatible TypeScript
 */
export default function typescriptNativePlugin(options = {}) {
  const { filename = DEFAULT_FILENAME, themes = {} } = options;

  return {
    name: 'typescript-native',
    async build({ tokens, outputFile }) {
      // Build base tokens with React Native transforms
      const baseTokens = {};

      for (const [id, token] of Object.entries(tokens)) {
        const camelCaseKey = toCamelCase(id);
        const handler = typeHandlers[token.$type] ?? ((v) => v);
        const processedValue = handler(token.$value);
        baseTokens[camelCaseKey] = transformForNative(processedValue, token.$type, camelCaseKey);
      }

      // Build theme overrides with transforms
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
            const processedValue = handler(themeToken.$value);
            themeOverrides[themeName][camelCaseKey] = transformForNative(
              processedValue,
              themeToken.$type || baseToken?.$type,
              camelCaseKey
            );
          }
        }
      }

      // Generate React Native specific TypeScript content
      const tsContent = `/**
 * Do not edit directly, this file was auto-generated.
 * React Native compatible tokens
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
      console.log('✓ Generated React Native TypeScript');
    },
  };
}
