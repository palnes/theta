import { formatColor } from '../formatters/color.js';
import {
  formatArray,
  formatDimension,
  formatLineHeight,
  formatShadow,
  isShadowArray,
} from '../formatters/css.js';
import { areTokenValuesEqual } from '../token-helpers.js';

// Constants
const DOT_SEPARATOR = /\./g;
const CAMEL_TO_KEBAB = /([a-z])([A-Z])/g;
const CSS_VAR_PREFIX = '--';
const DARK_THEME_SELECTOR = '[data-theme="dark"]';

/**
 * Terrazzo plugin that generates modular CSS files
 *
 * Generates:
 * - base.css: reference + semantic tokens
 * - components/*.css: individual component token files
 * - themes/*.css: theme-specific overrides
 *
 * @param {Object} options - Plugin options
 * @param {Object} options.themes - Theme tokens (e.g., { dark: {...} })
 * @param {Object} options.registry - Token registry instance
 * @returns {Object} Terrazzo plugin object
 */
export default function cssModularPlugin(options = {}) {
  const { themes = {}, registry } = options;

  // Convert token ID to CSS variable name
  const toCssVar = (id) => {
    return `${CSS_VAR_PREFIX}${id
      .replace(DOT_SEPARATOR, '-')
      .replace(CAMEL_TO_KEBAB, '$1-$2')
      .toLowerCase()}`;
  };

  // Type-specific formatters for CSS values
  const cssFormatters = {
    color: formatColor,
    dimension: formatDimension,
    shadow: formatShadow,
    fontFamily: formatArray,
    typography: (value) => value, // Return as-is for special handling
    // Default formatter
    default: (value) => {
      if (Array.isArray(value)) {
        return isShadowArray(value) ? formatShadow(value) : formatArray(value);
      }
      if (typeof value === 'object' && value !== null) {
        if (value.value !== undefined && value.unit !== undefined) {
          return formatDimension(value);
        }
      }
      return String(value);
    },
  };

  // Helper to format CSS value
  const formatValue = (value, type) => {
    const formatter = cssFormatters[type] || cssFormatters.default;
    return formatter(value);
  };

  // Format typography token into individual CSS properties
  const formatTypographyToken = (value, cssVar, lines) => {
    const typographyProperties = [
      { prop: 'fontFamily', suffix: 'font-family', formatter: formatArray },
      { prop: 'fontSize', suffix: 'font-size', formatter: formatDimension },
      { prop: 'fontWeight', suffix: 'font-weight', formatter: (v) => v },
      { prop: 'lineHeight', suffix: 'line-height', formatter: formatLineHeight },
    ];

    typographyProperties.forEach(({ prop, suffix, formatter }) => {
      if (value[prop]) {
        lines.push(`  ${cssVar}-${suffix}: ${formatter(value[prop])};`);
      }
    });
  };

  // Generate CSS content for a set of tokens
  const generateCSS = (tokens, selector = ':root') => {
    const lines = [`${selector} {`];

    for (const [id, token] of Object.entries(tokens)) {
      const cssVar = toCssVar(id);

      if (token.$type === 'typography' && typeof token.$value === 'object') {
        // Handle typography tokens specially - spread them into individual properties
        formatTypographyToken(token.$value, cssVar, lines);
      } else {
        // For all other tokens, use the normal formatting
        const value = formatValue(token.$value, token.$type);
        if (value !== null && value !== undefined) {
          lines.push(`  ${cssVar}: ${value};`);
        }
      }
    }

    lines.push('}');
    return lines.join('\n');
  };

  // Filter tokens by prefix
  const filterTokens = (tokens, prefix) => {
    const filtered = {};
    for (const [id, token] of Object.entries(tokens)) {
      if (id.startsWith(prefix)) {
        filtered[id] = token;
      }
    }
    return filtered;
  };

  return {
    name: 'css-modular',
    async build({ tokens, outputFile }) {
      // 1. Generate base.css (reference + semantic tokens)
      const baseTokens = {};
      for (const [id, token] of Object.entries(tokens)) {
        if (id.startsWith('ref.') || id.startsWith('sys.')) {
          baseTokens[id] = token;
        }
      }
      await outputFile('css/base.css', generateCSS(baseTokens));
      console.log('✓ Generated css/base.css');

      // 2. Generate component CSS files
      const components = new Set();
      for (const id of Object.keys(tokens)) {
        if (id.startsWith('cmp.')) {
          const component = id.split('.')[1];
          if (component) {
            components.add(component);
          }
        }
      }

      for (const component of components) {
        const componentTokens = filterTokens(tokens, `cmp.${component}.`);
        if (Object.keys(componentTokens).length > 0) {
          const filename = `css/components/${component}.css`;
          await outputFile(filename, generateCSS(componentTokens));
          console.log(`✓ Generated ${filename}`);
        }
      }

      // 3. Generate theme files
      // Light theme (empty for now, but maintains symmetry)
      await outputFile('css/themes/light.css', '/* Light theme - inherits from base */\n');

      // Dark theme (overrides only)
      if (themes.dark) {
        const darkOverrides = {};

        // Only include tokens that differ from base
        for (const [id, darkToken] of Object.entries(themes.dark)) {
          const baseToken = tokens[id];
          if (!baseToken || !areTokenValuesEqual(darkToken.$value, baseToken.$value)) {
            darkOverrides[id] = darkToken;
          }
        }

        if (Object.keys(darkOverrides).length > 0) {
          await outputFile('css/themes/dark.css', generateCSS(darkOverrides, DARK_THEME_SELECTOR));
          console.log(
            `✓ Generated css/themes/dark.css (${Object.keys(darkOverrides).length} overrides)`
          );
        }
      }

      // Register outputs with registry if provided
      if (registry) {
        for (const [id, token] of Object.entries(tokens)) {
          const cssVar = toCssVar(id);
          registry.registerOutput(id, 'css', {
            name: cssVar,
            value: formatValue(token.$value, token.$type),
            usage: `var(${cssVar})`,
          });
        }
      }
    },
  };
}
