import cssModularPlugin from './css-modular.js';

// Constants
const DOT_SEPARATOR = /\./g;
const CAMEL_TO_KEBAB = /([a-z])([A-Z])/g;
const CSS_VAR_PREFIX = '--';

/**
 * Wrapper for css-modular plugin that collects mappings
 */
export default function cssModularWithMappingsPlugin(options = {}) {
  const { mappingCollector, ...cssOptions } = options;
  const basePlugin = cssModularPlugin(cssOptions);

  // Convert token ID to CSS variable name
  const toCssVar = (id) => {
    return `${CSS_VAR_PREFIX}${id
      .replace(DOT_SEPARATOR, '-')
      .replace(CAMEL_TO_KEBAB, '$1-$2')
      .toLowerCase()}`;
  };

  return {
    name: 'css-modular-with-mappings',
    async build(buildOptions) {
      // Run the base plugin
      const result = await basePlugin.build(buildOptions);

      // If we have a mapping collector, generate mappings
      if (mappingCollector) {
        const { tokens } = buildOptions;
        const mappings = {};

        // Generate mappings for all tokens
        for (const [id, token] of Object.entries(tokens)) {
          const cssVar = toCssVar(id);

          // Typography tokens get multiple CSS variables
          if (token.$type === 'typography' && typeof token.$value === 'object') {
            const subMappings = {};

            if (token.$value.fontFamily) {
              subMappings[`${cssVar}-font-family`] = {
                name: `${cssVar}-font-family`,
                usage: `var(${cssVar}-font-family)`,
              };
            }
            if (token.$value.fontSize) {
              subMappings[`${cssVar}-font-size`] = {
                name: `${cssVar}-font-size`,
                usage: `var(${cssVar}-font-size)`,
              };
            }
            if (token.$value.fontWeight) {
              subMappings[`${cssVar}-font-weight`] = {
                name: `${cssVar}-font-weight`,
                usage: `var(${cssVar}-font-weight)`,
              };
            }
            if (token.$value.lineHeight) {
              subMappings[`${cssVar}-line-height`] = {
                name: `${cssVar}-line-height`,
                usage: `var(${cssVar}-line-height)`,
              };
            }

            mappings[id] = subMappings;
          } else {
            // Regular tokens get a single CSS variable
            mappings[id] = {
              name: cssVar,
              usage: `var(${cssVar})`,
            };
          }
        }

        // Add mappings to collector
        mappingCollector.addMappings('css', mappings);
      }

      return result;
    },
  };
}
