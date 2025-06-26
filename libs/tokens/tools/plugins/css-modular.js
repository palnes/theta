import { formatColor } from '../formatters/color.js';
import {
  formatArray,
  formatDimension,
  formatFontFamily,
  formatLineHeight,
  formatShadow,
  isShadowArray,
} from '../formatters/css.js';

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
 */
export default function cssModularPlugin(options = {}) {
  const { themes = {}, mappingCollector } = options;

  // Convert token ID to CSS variable name
  const toCssVar = (id) => {
    return `${CSS_VAR_PREFIX}${id
      .replace(DOT_SEPARATOR, '-')
      .replace(CAMEL_TO_KEBAB, '$1-$2')
      .toLowerCase()}`;
  };

  // Helper to format CSS value
  const formatValue = (value, type) => {
    // Handle arrays
    if (Array.isArray(value)) {
      if (isShadowArray(value)) {
        return formatShadow(value);
      }
      return formatArray(value);
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      // Dimension values
      if (value.value !== undefined && value.unit !== undefined) {
        return formatDimension(value);
      }

      // Colors
      if (type === 'color') {
        return formatColor(value);
      }

      // Typography composite values - return as-is for special handling
      if (type === 'typography') {
        return value;
      }

      // Shadow
      if (type === 'shadow') {
        return formatShadow(value);
      }
    }

    // String colors
    if (type === 'color' && typeof value === 'string') {
      return formatColor(value);
    }

    return String(value);
  };

  // Generate CSS content for a set of tokens
  const generateCSS = (tokens, selector = ':root') => {
    const lines = [`${selector} {`];

    for (const [id, token] of Object.entries(tokens)) {
      const cssVar = toCssVar(id);

      // Handle typography tokens specially - spread them into individual properties
      if (token.$type === 'typography' && typeof token.$value === 'object') {
        const value = token.$value;

        if (value.fontFamily) {
          lines.push(`  ${cssVar}-font-family: ${formatFontFamily(value.fontFamily)};`);
        }

        if (value.fontSize) {
          lines.push(`  ${cssVar}-font-size: ${formatDimension(value.fontSize)};`);
        }

        if (value.fontWeight) {
          lines.push(`  ${cssVar}-font-weight: ${value.fontWeight};`);
        }

        if (value.lineHeight) {
          lines.push(`  ${cssVar}-line-height: ${formatLineHeight(value.lineHeight)};`);
        }
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
      const mappings = {};
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
          if (!baseToken || JSON.stringify(darkToken.$value) !== JSON.stringify(baseToken.$value)) {
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
    },
  };
}
