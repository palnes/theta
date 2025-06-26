/**
 * Registry Adapter - Integrates TokenRegistry with existing Terrazzo plugins
 *
 * This adapter provides a bridge between the TokenRegistry and existing plugins,
 * allowing them to report their outputs without major modifications.
 */

import { TokenRegistry } from './token-registry.js';

/**
 * Creates a registry-aware version of a plugin
 */
export function withRegistry(plugin, registry) {
  return {
    ...plugin,

    async build(options) {
      // Create an instrumented outputFile function
      const originalOutputFile = options.outputFile;
      const instrumentedOutputFile = async (filename, contents) => {
        // Call original outputFile
        await originalOutputFile(filename, contents);

        // Extract format from plugin name or filename
        const format = extractFormat(plugin.name, filename);

        // Parse contents to extract token mappings
        const mappings = extractMappings(format, filename, contents, options.tokens);

        // Register mappings with the registry
        if (mappings) {
          const mappingCount = Object.keys(mappings).length;
          if (mappingCount > 0) {
            console.log(`  ✓ Captured ${mappingCount} ${format} mappings from ${filename}`);
          }
          Object.entries(mappings).forEach(([tokenId, outputData]) => {
            try {
              registry.registerOutput(tokenId, format, outputData);
            } catch (e) {
              // Token might not be registered yet
              if (options.tokens[tokenId]) {
                registry.registerToken(tokenId, options.tokens[tokenId]);
                registry.registerOutput(tokenId, format, outputData);
              }
            }
          });
        }
      };

      // Call original build with instrumented outputFile
      return plugin.build({
        ...options,
        outputFile: instrumentedOutputFile,
      });
    },
  };
}

/**
 * Extract format from plugin name or filename
 */
function extractFormat(pluginName, filename) {
  // Try to extract from plugin name first
  if (pluginName.includes('css')) return 'css';
  if (pluginName.includes('typescript')) return 'typescript';
  if (pluginName.includes('json')) return 'json';
  if (pluginName.includes('js')) return 'js';

  // Fall back to file extension
  const ext = filename.split('.').pop();
  return ext || 'unknown';
}

/**
 * Extract token mappings from generated content
 * This is a best-effort parser that handles common formats
 */
function extractMappings(format, filename, contents, tokens) {
  const mappings = {};

  switch (format) {
    case 'css':
      return extractCssMappings(contents, tokens);
    case 'js':
    case 'typescript':
      return extractJsMappings(contents, tokens);
    case 'json':
      return extractJsonMappings(contents, tokens);
    default:
      return null;
  }
}

/**
 * Extract CSS variable mappings
 */
function extractCssMappings(contents, tokens) {
  const mappings = {};
  const cssVarRegex = /(--[\w-]+):\s*([^;]+);/g;

  let match = cssVarRegex.exec(contents);
  while (match !== null) {
    const cssVar = match[1];
    const value = match[2].trim();

    // Try to find the token ID from the CSS variable name
    const tokenId = findTokenIdFromCssVar(cssVar, tokens);
    if (tokenId) {
      mappings[tokenId] = {
        name: cssVar,
        value: value,
        usage: `var(${cssVar})`,
      };
    }
    match = cssVarRegex.exec(contents);
  }

  return mappings;
}

/**
 * Extract JS/TS mappings
 */
function extractJsMappings(contents, tokens) {
  const mappings = {};

  // Try to parse as JSON first (common for token exports)
  try {
    const data = JSON.parse(contents);
    return extractJsonMappings(contents, tokens);
  } catch (e) {
    // Not JSON, try other patterns
  }

  // Look for export patterns
  const exportRegex = /export\s+const\s+(\w+)\s*=\s*['"`]([^'"`]+)['"`]/g;
  const objectPropRegex = /['"`]?([\w.]+)['"`]?\s*:\s*['"`]([^'"`]+)['"`]/g;

  let match = exportRegex.exec(contents);
  while (match !== null) {
    const varName = match[1];
    const value = match[2];

    // Try to find token ID from variable name
    const tokenId = findTokenIdFromJsVar(varName, tokens);
    if (tokenId) {
      mappings[tokenId] = {
        name: varName,
        value: value,
        usage: varName,
      };
    }
    match = exportRegex.exec(contents);
  }

  // Also check object properties
  match = objectPropRegex.exec(contents);
  while (match !== null) {
    const path = match[1];
    const value = match[2];

    if (tokens[path]) {
      mappings[path] = {
        name: path,
        value: value,
        usage: `tokens.${path}`,
      };
    }
    match = objectPropRegex.exec(contents);
  }

  return mappings;
}

/**
 * Extract JSON mappings
 */
function extractJsonMappings(contents, tokens) {
  try {
    const data = JSON.parse(contents);
    const mappings = {};

    function traverse(obj, path = '') {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Check if this is a token value object or needs deeper traversal
          if (value.$value !== undefined || value.value !== undefined) {
            // This is a token
            if (tokens[currentPath]) {
              mappings[currentPath] = {
                name: currentPath,
                value: value.$value || value.value || value,
                usage: currentPath,
              };
            }
          } else {
            // Traverse deeper
            traverse(value, currentPath);
          }
        } else if (tokens[currentPath]) {
          // Leaf value that matches a token
          mappings[currentPath] = {
            name: currentPath,
            value: value,
            usage: currentPath,
          };
        }
      });
    }

    traverse(data);
    return mappings;
  } catch (e) {
    return {};
  }
}

/**
 * Try to find token ID from CSS variable name
 */
function findTokenIdFromCssVar(cssVar, tokens) {
  // Remove -- prefix
  const varName = cssVar.slice(2);

  // Convert kebab-case to dot notation
  const dotPath = varName.replace(/-/g, '.');

  // Try direct match
  if (tokens[dotPath]) return dotPath;

  // Try with different separators
  const underscorePath = varName.replace(/-/g, '_');
  const camelPath = varName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

  // Search through all tokens
  for (const tokenId of Object.keys(tokens)) {
    // Convert token ID to CSS variable format
    // ref.fontSize.44 -> ref-font-size-44
    const tokenKebab = tokenId
      .replace(/\./g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();

    if (tokenKebab === varName.toLowerCase()) {
      return tokenId;
    }
  }

  return null;
}

/**
 * Try to find token ID from JS variable name
 */
function findTokenIdFromJsVar(varName, tokens) {
  // Try direct match
  if (tokens[varName]) return varName;

  // Convert camelCase to dot notation
  const dotPath = varName.replace(/([A-Z])/g, '.$1').toLowerCase();
  if (tokens[dotPath]) return dotPath;

  // Try replacing underscores with dots
  const underscorePath = varName.replace(/_/g, '.');
  if (tokens[underscorePath]) return underscorePath;

  return null;
}

/**
 * Create a registry-aware build function
 */
export function createRegistryBuild(registry) {
  return async function buildWithRegistry(tokens, plugins, options) {
    // Register all tokens first
    Object.entries(tokens).forEach(([id, token]) => {
      registry.registerToken(id, token);
    });

    // Wrap all plugins with registry
    const wrappedPlugins = plugins.map((plugin) => withRegistry(plugin, registry));

    // Run the build with wrapped plugins
    return options.originalBuild(tokens, wrappedPlugins, options);
  };
}
