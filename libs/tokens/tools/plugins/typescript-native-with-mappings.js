import typescriptNativePlugin from './typescript-native.js';

/**
 * Convert token path to camelCase
 */
function toCamelCase(path) {
  const parts = path.split('.');
  return parts
    .map((part, index) => {
      if (index === 0) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

/**
 * Convert token path to object access notation
 */
function toObjectPath(path) {
  const parts = path.split('.');
  return parts
    .map((part) => {
      // If part is a number or contains special chars, use bracket notation
      if (/^\d+$/.test(part) || /[^a-zA-Z0-9_$]/.test(part)) {
        return `['${part}']`;
      }
      return `.${part}`;
    })
    .join('')
    .replace(/^\./, '');
}

/**
 * Wrapper for typescript-native plugin that collects mappings
 */
export default function typescriptNativeWithMappingsPlugin(options = {}) {
  const { mappingCollector, ...tsOptions } = options;
  const basePlugin = typescriptNativePlugin(tsOptions);

  return {
    name: 'typescript-native-with-mappings',
    async build(buildOptions) {
      // Run the base plugin
      const result = await basePlugin.build(buildOptions);

      // If we have a mapping collector, generate mappings
      if (mappingCollector) {
        const { tokens } = buildOptions;
        const mappings = {};

        // Generate mappings for all tokens
        for (const [id, token] of Object.entries(tokens)) {
          mappings[id] = {
            name: toCamelCase(id),
            path: toObjectPath(id),
            usage: `tokens.${toObjectPath(id)}`,
            flatUsage: `tokens.${toCamelCase(id)}`,
          };
        }

        // Add mappings to collector
        mappingCollector.addMappings('js', mappings);
      }

      return result;
    },
  };
}
