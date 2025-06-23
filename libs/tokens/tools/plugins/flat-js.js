import { typeHandlers } from '../formatters/type-handlers.js';
import { toCamelCase } from '../formatters/utils.js';

/**
 * Custom Terrazzo plugin that generates flat JavaScript output with camelCase keys
 */
export default function flatJsPlugin(options = {}) {
  const { filename = 'tokens.js' } = options;

  return {
    name: 'flat-js',
    async build({ tokens, getTransforms, outputFile }) {
      // Build flat token object
      const flatTokens = {};

      // Process each token
      for (const [id, token] of Object.entries(tokens)) {
        // Since we don't define our own transforms, we'll use the raw token values
        const value = token.mode?.default?.$value ?? token.$value;

        const camelCaseKey = toCamelCase(id);

        // Get handler for token type or use default
        const handler = typeHandlers[token.$type] ?? ((v) => v);
        flatTokens[camelCaseKey] = handler(value);
      }

      // Generate JS content
      const jsContent = `/**
 * Do not edit directly, this file was auto-generated.
 */

module.exports = ${JSON.stringify(flatTokens, null, 2)};
`;

      await outputFile(filename, jsContent);
    },
  };
}
