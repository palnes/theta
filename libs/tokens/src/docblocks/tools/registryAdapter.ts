import type { TokenInfo, TokenUsage } from '../types/tokenReferenceTable';

export interface RegistryToken {
  id: string;
  value: any;
  type: string;
  outputs?: {
    css?: {
      name: string;
      value: string;
      usage: string;
    };
    js?: {
      name: string;
      value: string;
      usage: string;
    };
    [format: string]: any;
  };
  references?: string[];
  referencedBy?: string[];
  themes?: Record<string, { value: any; outputs: any }>;
  originalValue?: any;
  source?: any;
  metadata?: any;
}

// Helper function to format color components to CSS string
function formatColorToCss(colorValue: any): string {
  if (typeof colorValue !== 'object' || !colorValue.components) {
    return colorValue;
  }

  const { components, alpha = 1 } = colorValue;
  if (!components || components.length < 3) {
    return colorValue;
  }

  const [r, g, b] = components.map((c: number) => Math.round(c * 255));
  return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
}

// Helper function to build theme values and track overrides
function buildThemeValues(
  token: RegistryToken,
  formattedBaseValue: any
): {
  themeValues: Record<string, any>;
  overriddenIn: string[];
} {
  const themeValues: Record<string, any> = {};
  const overriddenIn: string[] = [];

  if (!token.themes) {
    return { themeValues, overriddenIn };
  }

  for (const [theme, themeData] of Object.entries(token.themes)) {
    let themeValue = themeData.value;

    // Format theme values consistently
    if (token.type === 'color') {
      themeValue = formatColorToCss(themeValue);
    }

    themeValues[theme] = themeValue;

    // Check if this theme actually overrides the base value
    if (JSON.stringify(themeValue) !== JSON.stringify(formattedBaseValue)) {
      overriddenIn.push(theme);
    }
  }

  return { themeValues, overriddenIn };
}

// Helper function to determine display value based on token type
function getDisplayValue(token: RegistryToken, cssOutput: any): any {
  if (token.type === 'color') {
    // For colors, use the base token value (which is the light theme value)
    return token.value;
  }

  if (token.type === 'typography') {
    // For typography, use the CSS output which has resolved values
    return cssOutput?.value || token.value;
  }

  // For other types, use CSS output if available
  return cssOutput?.value || token.value;
}

// Helper function to format display value
function formatDisplayValue(displayValue: any, tokenType: string): any {
  if (
    tokenType === 'dimension' &&
    typeof displayValue === 'object' &&
    displayValue.value !== undefined
  ) {
    return `${displayValue.value}${displayValue.unit || 'px'}`;
  }

  if (tokenType === 'color') {
    return formatColorToCss(displayValue);
  }

  if (tokenType === 'typography' && typeof displayValue === 'object') {
    // For typography tokens, ensure values are resolved
    const formatted: Record<string, any> = {};
    for (const [key, value] of Object.entries(displayValue)) {
      if (typeof value === 'object' && value !== null && 'value' in value) {
        formatted[key] = value.value;
      } else {
        formatted[key] = value;
      }
    }
    return formatted;
  }

  return displayValue;
}

// Helper function to build usage array
function buildUsage(tokenId: string, cssOutput: any): TokenUsage[] {
  const cssVar = cssOutput?.name || `--${tokenId.replace(/\./g, '-')}`;
  const jsonPath = tokenId;
  const jsFlat = tokenId
    .split('.')
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');

  return [
    { label: 'CSS', value: cssVar },
    { label: 'JSON', value: jsonPath },
    { label: 'JS', value: jsFlat },
  ];
}

/**
 * Convert a registry token to the TokenInfo format expected by components
 */
export function registryTokenToTokenInfo(token: RegistryToken): TokenInfo | TokenInfo[] {
  // Extract the token name from the path
  const pathParts = token.id.split('.');
  const name = pathParts[pathParts.length - 1] || 'unknown';

  // Get CSS output
  const cssOutput = token.outputs?.css;

  // Build references array
  const references = (token.references || []).map((refId) => ({
    path: refId,
    value: refId,
    type: 'reference',
  }));

  // Format the base value for comparison
  const formattedBaseValue = token.type === 'color' ? formatColorToCss(token.value) : token.value;

  // Build theme values
  const { themeValues, overriddenIn } = buildThemeValues(token, formattedBaseValue);

  // Get display value
  const displayValue = getDisplayValue(token, cssOutput);

  // Format the display value
  const formattedValue = formatDisplayValue(displayValue, token.type);

  // Build usage array
  const usage = buildUsage(token.id, cssOutput);

  const tokenInfo: TokenInfo = {
    name,
    path: token.id,
    type: token.type || 'unknown',
    description: token.metadata?.description || '',
    originalValue: token.originalValue || token.value,
    value: formattedValue,
    usage,
    hasReferences: references.length > 0,
    references,
    expandedValue: formattedValue,
    themeValues: Object.keys(themeValues).length > 0 ? themeValues : undefined,
    isThemeable: overriddenIn.length > 0,
    overriddenIn: overriddenIn.length > 0 ? overriddenIn : undefined,
    referencedBy: token.referencedBy || [],
    expandedFrom: token.metadata?.expandedFrom,
  };

  return tokenInfo;
}

// Helper to check if a property is a typography property
function isTypographyProperty(propKey: string): boolean {
  return ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing'].includes(propKey);
}

// Helper to process typography token properties
function processTypographyToken(token: any, results: RegistryToken[]): void {
  for (const [propKey, propValue] of Object.entries(token)) {
    if (
      propValue &&
      typeof propValue === 'object' &&
      'id' in propValue &&
      isTypographyProperty(propKey)
    ) {
      results.push(propValue as RegistryToken);
    }
  }
}

// Helper to process a single value in the flattening process
function processValue(key: string, value: any, path: string[], results: RegistryToken[]): void {
  const currentPath = [...path, key];

  if (!value || typeof value !== 'object') {
    return;
  }

  // Check if this is a token (has an id property)
  if ('id' in value) {
    results.push(value as RegistryToken);

    // Only check for nested expanded tokens within typography tokens
    const token = value as RegistryToken;
    if (token.type === 'typography' || token.metadata?.parentType === 'typography') {
      processTypographyToken(value, results);
    }
  } else {
    // Recurse into nested objects
    results.push(...flattenRegistryTokens(value, currentPath));
  }
}

/**
 * Flatten nested registry tokens into a flat array
 */
export function flattenRegistryTokens(obj: any, path: string[] = []): RegistryToken[] {
  const results: RegistryToken[] = [];

  for (const [key, value] of Object.entries(obj)) {
    processValue(key, value, path, results);
  }

  return results;
}

/**
 * Group flat tokens by category
 */
export function groupTokensByCategory(tokens: RegistryToken[]): Record<string, TokenInfo[]> {
  const grouped: Record<string, TokenInfo[]> = {};

  for (const token of tokens) {
    const parts = token.id.split('.');
    // Category is the second part (e.g., ref.color.blue -> color)
    const category = parts.length > 1 ? parts[1] : 'other';

    if (!category) continue; // Skip if no category

    if (!grouped[category]) {
      grouped[category] = [];
    }

    const tokenInfo = registryTokenToTokenInfo(token);
    const categoryTokens = grouped[category];
    if (!categoryTokens) continue; // This should never happen, but satisfies TypeScript

    // Handle both single token and array of tokens (for expanded typography)
    if (Array.isArray(tokenInfo)) {
      // For expanded tokens, ensure they maintain the correct tier prefix
      const validTokens = tokenInfo.filter((t) => {
        // Extract tier from the original token id
        const tier = token.id.split('.')[0];
        return t.path?.startsWith(`${tier}.`);
      });
      categoryTokens.push(...validTokens);
    } else {
      categoryTokens.push(tokenInfo);
    }
  }

  return grouped;
}
