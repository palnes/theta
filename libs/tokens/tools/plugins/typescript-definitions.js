import { typeHandlers } from '../formatters/type-handlers.js';
import { toCamelCase } from '../formatters/utils.js';

/**
 * Terrazzo plugin to generate TypeScript definitions for tokens
 */
export default function typescriptDefinitionsPlugin(options = {}) {
  const { filename = 'tokens.d.ts' } = options;

  return {
    name: 'typescript-definitions',
    async build({ tokens, outputFile }) {
      // Generate TypeScript definitions content
      const content = generateTypeScriptDefinitions(tokens);

      // Write the file
      await outputFile(filename, content);
    },
  };
}

/**
 * Generate TypeScript definitions from tokens
 */
function generateTypeScriptDefinitions(tokens) {
  const lines = [
    '/**',
    ' * Do not edit directly, this file was auto-generated.',
    ' */',
    '',
    'export default tokens;',
    '',
    'declare interface DesignToken {',
    '  $value?: any;',
    '  $type?: string;',
    '  $description?: string;',
    '  name?: string;',
    '  themeable?: boolean;',
    '  attributes?: Record<string, unknown>;',
    '  [key: string]: any;',
    '}',
    '',
    'declare const tokens: {',
  ];

  // Get all token keys and convert to flat format
  const tokenKeys = Object.keys(tokens).sort();

  // Add each token as a property with literal type
  tokenKeys.forEach((key, index) => {
    const token = tokens[key];
    // Handle mode values
    const rawValue = token.mode?.default?.$value ?? token.$value;

    // Process the value using the appropriate handler
    const handler = typeHandlers[token.$type] ?? ((v) => v);
    const processedValue = handler(rawValue);

    const valueType = getTypeForValue(processedValue, token);

    // Convert to camelCase for the property name
    const propName = toCamelCase(key);

    // Add the property with its literal value type
    lines.push(`  "${propName}": ${valueType};`);
  });

  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

/**
 * Get TypeScript type for a token value
 */
function getTypeForValue(value, token) {
  // Handle special token types
  if (token?.$type === 'color' && typeof value === 'object' && value.hex) {
    // For color objects, use the hex value as string literal
    return `"${value.hex}"`;
  }

  if (typeof value === 'string') {
    // Return string literal type
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === 'number') {
    // Return number literal type
    return String(value);
  }
  if (typeof value === 'boolean') {
    // Return boolean literal type
    return String(value);
  }
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (Array.isArray(value)) {
    // Handle arrays - check if it's font family
    if (token?.$type === 'fontFamily') {
      return 'string[]';
    }
    return 'any[]';
  }
  if (typeof value === 'object') {
    // Handle complex types like typography, shadow, etc.
    if (token?.$type === 'typography') {
      return '{ fontFamily: string[]; fontSize: number; fontWeight: number; lineHeight: number; }';
    }
    if (token?.$type === 'shadow') {
      return '{ shadowColor: string; shadowOffset: { width: number; height: number; }; shadowOpacity: number; shadowRadius: number; boxShadow: string; }';
    }
    return 'any';
  }

  return 'any';
}
