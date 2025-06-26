/**
 * Generic documentation plugin for design tokens
 * Outputs a platform-agnostic, extensible format
 */

const DEFAULT_FILENAME = 'docs/tokens-generic.json';

/**
 * Extract token references from a value
 */
function extractReferences(value) {
  const references = [];

  if (typeof value === 'string') {
    const matches = value.match(/\{([^}]+)\}/g);
    if (matches) {
      references.push(...matches.map((match) => match.slice(1, -1)));
    }
  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    Object.values(value).forEach((val) => {
      if (typeof val === 'string') {
        const matches = val.match(/\{([^}]+)\}/g);
        if (matches) {
          references.push(...matches.map((match) => match.slice(1, -1)));
        }
      }
    });
  }

  return [...new Set(references)]; // Remove duplicates
}

/**
 * Build reverse reference map
 */
function buildReverseReferences(tokens) {
  const reverseRefs = {};

  Object.entries(tokens).forEach(([id, token]) => {
    const refs = extractReferences(token.originalValue?.$value || token.$value);
    refs.forEach((ref) => {
      if (!reverseRefs[ref]) {
        reverseRefs[ref] = [];
      }
      reverseRefs[ref].push(id);
    });
  });

  return reverseRefs;
}

/**
 * Detect groups from token paths
 */
function detectGroups(tokens) {
  const groups = {};

  Object.keys(tokens).forEach((path) => {
    const parts = path.split('.');

    // Get immediate parent group
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('.');

      if (!groups[parentPath]) {
        groups[parentPath] = {
          name: parts
            .slice(0, -1)
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' '),
          tokens: [],
          subgroups: [],
        };
      }

      groups[parentPath].tokens.push(path);
    }
  });

  // Build subgroup relationships
  Object.keys(groups).forEach((groupPath) => {
    const parts = groupPath.split('.');
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('.');
      if (groups[parentPath]) {
        groups[parentPath].subgroups.push(groupPath);
      }
    }
  });

  // Add token counts
  Object.values(groups).forEach((group) => {
    group.tokenCount = group.tokens.length;
    group.subgroupCount = group.subgroups.length;
  });

  return groups;
}

/**
 * Generic documentation plugin
 */
export default function genericDocsPlugin(options = {}) {
  const {
    filename = DEFAULT_FILENAME,
    themes = {},
    includeGroups = true,
    includeStats = true,
    customTransforms = {},
    mappingCollector,
  } = options;

  return {
    name: 'generic-docs',
    async build({ tokens, outputFile }) {
      const reverseRefs = buildReverseReferences(tokens);
      const tokenMap = {};

      // Process each token
      Object.entries(tokens).forEach(([path, token]) => {
        const references = extractReferences(token.originalValue?.$value || token.$value);

        // Build token entry
        const hasReference =
          token.originalValue &&
          typeof token.originalValue.$value === 'string' &&
          token.originalValue.$value.startsWith('{');
        const entry = {
          id: path,
          value: token.originalValue?.$value || token.$value, // Token definition
          resolvedValue: hasReference ? token.$value : undefined, // Only include if token has references
          type: token.$type || 'unknown',

          // Add output mappings if available
          outputs: mappingCollector ? mappingCollector.getTokenMappings(path) : undefined,

          // Documentation - only include if present
          documentation:
            token.$description || token.$deprecated || token.$tags
              ? {
                  description: token.$description,
                  deprecated: token.$deprecated,
                  tags: token.$tags,
                }
              : undefined,

          // Relationships - only include what exists
          relationships: {
            references: references.length > 0 ? references : undefined,
            referencedBy: reverseRefs[path]?.length > 0 ? reverseRefs[path] : undefined,
          },

          // Variants (themes) - will include all themes
          variants: {},
        };

        // Clean up undefined fields and redundant resolvedValue
        Object.keys(entry).forEach((key) => {
          if (entry[key] === undefined) {
            delete entry[key];
          }
        });

        // Clean up empty relationships
        if (
          entry.relationships &&
          !entry.relationships.references &&
          !entry.relationships.referencedBy
        ) {
          entry.relationships = undefined;
        }

        // Process theme variants - include resolved values for ALL themes
        Object.entries(themes).forEach(([themeName, themeTokens]) => {
          const themeToken = themeTokens[path];
          if (themeToken) {
            entry.variants[themeName] = themeToken.$value;
          }
        });

        // Only keep variants if values differ between themes
        const variantValues = Object.values(entry.variants);
        const allSame = variantValues.every(
          (v) => JSON.stringify(v) === JSON.stringify(variantValues[0])
        );
        if (allSame && variantValues.length > 0) {
          // If all themes have the same value, just use that as the base value
          entry.value = variantValues[0];
          entry.variants = undefined;
        }

        // Add to nested structure
        const parts = path.split('.');
        let current = tokenMap;

        // Build nested path
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        // Set the token at the final key
        current[parts[parts.length - 1]] = entry;
      });

      // Build final documentation
      const documentation = {
        tokens: tokenMap,

        // Define available formats with transformation rules
        formats: {
          css: 'kebab-case-custom-properties',
          js: 'camelCase',
          json: 'dot-notation',
          scss: 'scss-variables',
        },

        // Define variants
        variants: Object.keys(themes).reduce((acc, themeName) => {
          acc[themeName] = {
            name: themeName.charAt(0).toUpperCase() + themeName.slice(1),
            type: 'theme',
            tokens: {}, // Token overrides are stored per token in variants field
          };
          return acc;
        }, {}),

        metadata: {
          timestamp: new Date().toISOString(),
          stats: includeStats
            ? {
                total: Object.keys(tokens).length,
              }
            : undefined,
        },
      };

      // Clean up undefined fields at root level
      Object.keys(documentation).forEach((key) => {
        if (documentation[key] === undefined) {
          delete documentation[key];
        }
      });

      const content = JSON.stringify(documentation, null, 2);
      await outputFile(filename, content);
      console.log('✓ Generic documentation generated');
    },
  };
}
