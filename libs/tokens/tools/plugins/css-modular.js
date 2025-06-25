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
  const { themes = {} } = options;

  // Convert token ID to CSS variable name
  const toCssVar = (id) => {
    return `${CSS_VAR_PREFIX}${id
      .replace(DOT_SEPARATOR, '-')
      .replace(CAMEL_TO_KEBAB, '$1-$2')
      .toLowerCase()}`;
  };

  // Helper to format CSS value
  const formatValue = (value, type) => {
    // Handle arrays first
    if (Array.isArray(value)) {
      // Shadow array
      if (value.length > 0 && typeof value[0] === 'object' && value[0].offsetX !== undefined) {
        return value
          .map((shadow) => {
            const parts = [];
            const formatDimension = (dim) => {
              if (typeof dim === 'object' && dim.value !== undefined && dim.unit !== undefined) {
                return `${dim.value}${dim.unit}`;
              }
              return dim;
            };
            if (shadow.offsetX !== undefined) parts.push(formatDimension(shadow.offsetX));
            if (shadow.offsetY !== undefined) parts.push(formatDimension(shadow.offsetY));
            if (shadow.blur !== undefined) parts.push(formatDimension(shadow.blur));
            if (shadow.spread !== undefined) parts.push(formatDimension(shadow.spread));
            if (shadow.color) {
              if (
                typeof shadow.color === 'object' &&
                shadow.color.colorSpace &&
                shadow.color.components
              ) {
                const [r, g, b, a = 1] = shadow.color.components;
                parts.push(
                  `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
                );
              } else {
                parts.push(shadow.color);
              }
            }
            return parts.join(' ');
          })
          .join(', ');
      }

      // Regular arrays (font families, etc.)
      const filtered = value.filter((v) => v && (typeof v === 'string' ? v.trim() : true));
      if (filtered.length === 0) return 'initial';

      return filtered
        .map((v) => {
          if (typeof v === 'string' && v.includes(' ')) {
            return `"${v}"`;
          }
          return String(v);
        })
        .join(', ');
    }

    if (typeof value === 'object' && value !== null) {
      // Dimension values
      if (value.value !== undefined && value.unit !== undefined) {
        return `${value.value}${value.unit}`;
      }
      // Colors
      if (type === 'color' && value.colorSpace && value.components) {
        const [r, g, b, a = 1] = value.components;
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      }
      // Typography composite
      if (type === 'typography') {
        return 'initial';
      }
      // Shadow fallback
      if (type === 'shadow') {
        return 'none';
      }
    }

    return String(value);
  };

  // Generate CSS content for a set of tokens
  const generateCSS = (tokens, selector = ':root') => {
    const lines = [`${selector} {`];

    for (const [id, token] of Object.entries(tokens)) {
      const cssVar = toCssVar(id);
      const value = formatValue(token.$value, token.$type);
      lines.push(`  ${cssVar}: ${value};`);
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
