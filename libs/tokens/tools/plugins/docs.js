import { typeHandlers } from '../formatters/type-handlers.js';
import { toCamelCase } from '../formatters/utils.js';

/**
 * Format dimension value for documentation display
 */
function formatDimensionForDocs(value) {
  if (typeof value === 'object' && value.value !== undefined && value.unit) {
    return `${value.value}${value.unit}`;
  }
  return value;
}

/**
 * Convert camelCase to kebab-case (standard CSS property naming)
 */
function toKebabCase(str) {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`).replace(/^-/, ''); // Remove leading dash if any
}

/**
 * Convert token path to CSS variable name
 */
function pathToCssVariable(path) {
  return `--${path
    .split('.')
    .map((segment) => toKebabCase(segment))
    .join('-')}`;
}

/**
 * Extract references from a token value
 */
function extractReferences(value, tokens) {
  const references = [];

  // Handle string references like "{ref.color.blue.600}"
  if (typeof value === 'string') {
    const matches = value.match(/\{([^}]+)\}/g);
    if (matches) {
      matches.forEach((match) => {
        const refPath = match.slice(1, -1); // Remove { and }
        const refToken = tokens[refPath];
        if (refToken) {
          references.push({
            path: refPath,
            value: refToken.$value,
            type: refToken.$type || 'unknown',
          });
        }
      });
    }
  }

  // Handle object values that might contain references
  else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, val]) => {
      if (typeof val === 'string' && val.match(/\{([^}]+)\}/)) {
        const matches = val.match(/\{([^}]+)\}/g);
        matches?.forEach((match) => {
          const refPath = match.slice(1, -1);
          const refToken = tokens[refPath];
          if (refToken) {
            references.push({
              path: refPath,
              value: refToken.$value,
              type: refToken.$type || 'unknown',
              property: key,
            });
          }
        });
      }
    });
  }

  return references;
}

/**
 * Terrazzo plugin that generates documentation
 */
export default function docsPlugin(options = {}) {
  const { filename = 'docs/tokens-reference.json' } = options;

  return {
    name: 'docs',
    async build({ tokens, outputFile }) {
      const documentation = {
        ref: {},
        sys: {},
        cmp: {},
        metadata: {
          generatedAt: new Date().toISOString(),
          totalTokens: Object.keys(tokens).length,
        },
      };

      // Process tokens to create documentation structure
      Object.entries(tokens).forEach(([path, token]) => {
        const parts = path.split('.');
        const tier = parts[0];
        const category = parts[1];

        if (!['ref', 'sys', 'cmp'].includes(tier)) return;

        if (!documentation[tier]) documentation[tier] = {};
        if (!documentation[tier][category]) {
          documentation[tier][category] = [];
        }

        // Extract references from token metadata
        const references = [];

        // First check originalValue for the immediate reference (not fully resolved)
        if (token.originalValue?.$value) {
          const extractedRefs = extractReferences(token.originalValue.$value, tokens);
          references.push(...extractedRefs);
        }

        // Only use aliasOf if we didn't find references in originalValue
        // This ensures we show immediate references, not fully resolved ones
        if (!references.length) {
          const defaultMode = token.mode?.['.'];
          if (defaultMode?.aliasOf) {
            const refToken = tokens[defaultMode.aliasOf];
            if (refToken) {
              references.push({
                path: defaultMode.aliasOf,
                value: refToken.$value,
                type: refToken.$type || 'unknown',
              });
            }
          }
        }

        // Format value based on type for documentation
        let formattedValue = token.$value;

        // Special handling for dimensions in docs (keep units for display)
        if (token.$type === 'dimension') {
          formattedValue = formatDimensionForDocs(token.$value);
        } else {
          // Use type handlers for other types
          const handler = typeHandlers[token.$type];
          if (handler) {
            formattedValue = handler(token.$value);
          }
        }

        documentation[tier][category].push({
          name: parts[parts.length - 1],
          path: path,
          type: token.$type || 'unknown',
          description: token.$description || '',
          originalValue: token.originalValue || token.$value,
          value: formattedValue,
          cssVariable: pathToCssVariable(path),
          jsPath: path,
          jsFlat: toCamelCase(path),
          hasReferences: references.length > 0,
          references: references,
        });
      });

      const content = JSON.stringify(documentation, null, 2);
      await outputFile(filename, content);
      console.log('✓ Documentation generated');
    },
  };
}
