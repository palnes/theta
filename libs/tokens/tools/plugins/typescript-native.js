import { typeHandlers } from '../formatters/type-handlers.js';
import { areTokenValuesEqual } from '../token-helpers.js';

// Constants
const DEFAULT_FILENAME = 'tokens.native.ts';
const DIMENSION_REGEX = /^(-?\d+(?:\.\d+)?)(px|pt|dp|sp)?$/;
const FONT_WEIGHT_THRESHOLD = 10;
const FONT_FAMILY_KEYS = ['fontfamily', 'font-family'];
const FONT_WEIGHT_KEYS = ['fontweight', 'font-weight'];

// Transform strategies for different token types
const transformStrategies = {
  typography: (value) => ({
    ...value,
    fontFamily: Array.isArray(value.fontFamily) ? value.fontFamily[0] : value.fontFamily,
    fontWeight: value.fontWeight ? String(value.fontWeight) : undefined,
  }),

  shadow: (value) => {
    const { boxShadow, ...nativeShadow } = value;
    return nativeShadow;
  },

  dimension: (value) => {
    if (typeof value !== 'string') return value;
    const match = value.match(DIMENSION_REGEX);
    return match ? Number.parseFloat(match[1]) : value;
  },
};

// Key-based transformations
const keyTransforms = [
  {
    matches: (key) => FONT_FAMILY_KEYS.some((k) => key.toLowerCase().includes(k)),
    condition: (value) => Array.isArray(value),
    transform: (value) => value[0],
  },
  {
    matches: (key) => FONT_WEIGHT_KEYS.some((k) => key.toLowerCase().includes(k)),
    condition: (value) => typeof value === 'number',
    transform: (value) => String(value),
  },
];

/**
 * Convert dot notation to camelCase
 * @private
 * @param {string} dotNotation - Dot notation string
 * @returns {string} camelCase version
 * @example
 * dotNotationToCamelCase('cmp.button.paddingX') // 'cmpButtonPaddingX'
 */
function dotNotationToCamelCase(dotNotation) {
  return dotNotation
    .split('.')
    .map((part, index) => {
      // Handle hyphenated parts (e.g., 'semi-bold' -> 'semiBold')
      const camelPart = part.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      // Capitalize first letter of each part except the first
      if (index === 0) {
        return camelPart;
      }
      return camelPart.charAt(0).toUpperCase() + camelPart.slice(1);
    })
    .join('');
}

/**
 * Transform tokens for React Native compatibility
 * @private
 * @param {*} value - Token value to transform
 * @param {string} type - Token type
 * @param {string} key - Token key/name
 * @returns {*} Transformed value for React Native
 */
function transformForNative(value, type, key) {
  // Apply key-based transformations first
  for (const { matches, condition, transform } of keyTransforms) {
    if (key && matches(key) && condition(value)) {
      return transform(value);
    }
  }

  // Apply type-based transformations
  const strategy = transformStrategies[type];
  if (strategy && typeof value === 'object') {
    return strategy(value);
  }

  return value;
}

/**
 * Terrazzo plugin that generates React Native compatible TypeScript
 *
 * @param {Object} options - Plugin options
 * @param {string} options.filename - Output filename (default: 'tokens.native.ts')
 * @param {Object} options.themes - Theme tokens (e.g., { dark: {...} })
 * @param {Object} options.registry - Token registry instance
 * @returns {Object} Terrazzo plugin object
 */
export default function typescriptNativePlugin(options = {}) {
  const { filename = DEFAULT_FILENAME, themes = {}, registry } = options;

  return {
    name: 'typescript-native',
    async build({ tokens, outputFile }) {
      // Build base tokens with React Native transforms
      const baseTokens = {};

      for (const [id, token] of Object.entries(tokens)) {
        const camelCaseKey = dotNotationToCamelCase(id);
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

          if (!baseToken || !areTokenValuesEqual(themeToken.$value, baseToken.$value)) {
            const camelCaseKey = dotNotationToCamelCase(id);
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

      // Register outputs with registry if provided
      if (registry) {
        for (const [id, token] of Object.entries(tokens)) {
          const camelCaseKey = dotNotationToCamelCase(id);
          registry.registerOutput(id, 'typescript', {
            name: camelCaseKey,
            value: baseTokens[camelCaseKey],
            usage: `tokens.${camelCaseKey}`,
          });
        }
      }
    },
  };
}
