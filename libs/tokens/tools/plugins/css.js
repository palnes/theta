// Constants
const DEFAULT_FILENAME = 'tokens.css';
const DOT_SEPARATOR = /\./g;
const CAMEL_TO_KEBAB = /([a-z])([A-Z])/g;
const CSS_VAR_PREFIX = '--';
const DARK_THEME_SELECTOR = '[data-theme="dark"]';

/**
 * Terrazzo plugin that generates CSS with theme overrides
 *
 * Generates a CSS file with:
 * - Base tokens in :root
 * - Dark theme overrides in [data-theme="dark"]
 * - Only includes tokens that differ between themes
 */
export default function cssPlugin(options = {}) {
  const { filename = DEFAULT_FILENAME, themes = {} } = options;

  // Convert token ID to CSS variable name
  // 'cmp.button.paddingX' -> '--cmp-button-padding-x'
  const toCssVar = (id) => {
    return `${CSS_VAR_PREFIX}${id
      .replace(DOT_SEPARATOR, '-')
      .replace(CAMEL_TO_KEBAB, '$1-$2') // camelCase to kebab-case
      .toLowerCase()}`;
  };

  return {
    name: 'css',
    async build({ tokens, outputFile }) {
      const lines = [];

      // Helper to format CSS value
      const formatValue = (value, type) => {
        // Handle arrays first (before checking for objects)
        if (Array.isArray(value)) {
          // Check if this is a shadow array
          if (value.length > 0 && typeof value[0] === 'object' && value[0].offsetX !== undefined) {
            // Handle shadows
            return value
              .map((shadow) => {
                const parts = [];
                // Handle dimension objects
                const formatDimension = (dim) => {
                  if (
                    typeof dim === 'object' &&
                    dim.value !== undefined &&
                    dim.unit !== undefined
                  ) {
                    return `${dim.value}${dim.unit}`;
                  }
                  return dim;
                };
                if (shadow.offsetX !== undefined) parts.push(formatDimension(shadow.offsetX));
                if (shadow.offsetY !== undefined) parts.push(formatDimension(shadow.offsetY));
                if (shadow.blur !== undefined) parts.push(formatDimension(shadow.blur));
                if (shadow.spread !== undefined) parts.push(formatDimension(shadow.spread));
                if (shadow.color) {
                  // Handle color object
                  if (
                    typeof shadow.color === 'object' &&
                    shadow.color.colorSpace &&
                    shadow.color.components
                  ) {
                    const [r, g, b, a = 1] = shadow.color.components;
                    // Always use rgba for better browser support
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

          // Handle regular arrays (font families, transition easings, etc.)
          // Filter out empty values and wrap font names with spaces in quotes
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
          // Handle dimension values
          if (value.value !== undefined && value.unit !== undefined) {
            return `${value.value}${value.unit}`;
          }
          // Handle colors parsed by Terrazzo
          if (type === 'color' && value.colorSpace && value.components) {
            const [r, g, b, a = 1] = value.components;
            // Always use rgba for better browser support
            return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
          }
          // Handle typography composite values
          if (type === 'typography') {
            // Typography is composite, not directly usable in CSS
            return 'initial';
          }
          // Handle shadows
          if (type === 'shadow') {
            return 'none'; // Fallback
          }
        }

        // Handle color strings
        if (type === 'color' && typeof value === 'string') {
          return value;
        }
        return String(value);
      };

      // Generate base/light theme tokens
      lines.push('/* Base tokens (light theme) */');
      lines.push(':root {');

      for (const [id, token] of Object.entries(tokens)) {
        const cssVar = toCssVar(id);
        const value = formatValue(token.$value, token.$type);
        lines.push(`  ${cssVar}: ${value};`);
      }

      lines.push('}');
      lines.push('');

      // Generate dark theme overrides
      if (themes.dark) {
        lines.push('/* Dark theme overrides */');
        lines.push(`${DARK_THEME_SELECTOR} {`);

        let overrideCount = 0;
        // Only output tokens that are different in dark theme
        for (const [id, darkToken] of Object.entries(themes.dark)) {
          // Skip if the token doesn't exist in base or has the same value
          const baseToken = tokens[id];
          if (!baseToken || JSON.stringify(darkToken.$value) === JSON.stringify(baseToken.$value)) {
            continue;
          }

          const cssVar = toCssVar(id);
          const value = formatValue(darkToken.$value, darkToken.$type || baseToken.$type);
          lines.push(`  ${cssVar}: ${value};`);
          overrideCount++;
        }

        lines.push('}');
        console.log(`  → ${overrideCount} dark theme overrides`);
      }

      const content = lines.join('\n');
      await outputFile(filename, content);
      console.log('✓ Generated CSS');
    },
  };
}
