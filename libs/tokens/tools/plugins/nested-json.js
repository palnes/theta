import { typeHandlers } from '../formatters/type-handlers.js';
import { setNestedValue } from '../formatters/utils.js';

/**
 * Custom Terrazzo plugin that generates nested JSON output
 */
export default function nestedJsonPlugin(options = {}) {
  const { filename = 'tokens.json' } = options;

  return {
    name: 'nested-json',
    async build({ tokens, getTransforms, outputFile }) {
      // Build nested token object
      const nestedTokens = {};

      // Process each token
      for (const [id, token] of Object.entries(tokens)) {
        // Since we don't define our own transforms, we'll use the raw token values
        const value = token.mode?.default?.$value ?? token.$value;

        // Get handler for token type or use default
        const handler = typeHandlers[token.$type] ?? ((v) => v);
        const formattedValue = handler(value);

        // Set value in nested structure
        setNestedValue(nestedTokens, id, formattedValue);
      }

      // Generate JSON content
      const jsonContent = JSON.stringify(nestedTokens, null, 2);

      await outputFile(filename, jsonContent);
    },
  };
}
