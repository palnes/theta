import { TokenInfo, TokenUsage } from '../types/tokenReferenceTable';

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

/**
 * Convert a registry token to the TokenInfo format expected by components
 */
export function registryTokenToTokenInfo(token: RegistryToken): TokenInfo | TokenInfo[] {
  // Extract the token name from the path
  const pathParts = token.id.split('.');
  const name = pathParts[pathParts.length - 1] || 'unknown';

  // Get CSS and JS outputs
  const cssOutput = token.outputs?.css;

  // Build references array
  const references = (token.references || []).map((refId) => ({
    path: refId,
    value: refId, // Will be resolved later if needed
    type: 'reference',
  }));

  // Build theme values and track which themes actually override the base
  const themeValues: Record<string, any> = {};
  const overriddenIn: string[] = [];

  // First, format the base value for comparison
  let formattedBaseValue = token.value;
  if (
    token.type === 'color' &&
    typeof formattedBaseValue === 'object' &&
    formattedBaseValue.components
  ) {
    const { components, alpha = 1 } = formattedBaseValue;
    if (components && components.length >= 3) {
      const [r, g, b] = components.map((c: number) => Math.round(c * 255));
      formattedBaseValue = alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
    }
  }

  if (token.themes) {
    Object.entries(token.themes).forEach(([theme, themeData]) => {
      // Format theme values consistently
      let themeValue = themeData.value;
      if (token.type === 'color' && typeof themeValue === 'object' && themeValue.components) {
        // Format color object to CSS string
        const { components, alpha = 1 } = themeValue;
        if (components && components.length >= 3) {
          const [r, g, b] = components.map((c: number) => Math.round(c * 255));
          themeValue = alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
        }
      }
      themeValues[theme] = themeValue;

      // Check if this theme actually overrides the base value
      if (JSON.stringify(themeValue) !== JSON.stringify(formattedBaseValue)) {
        overriddenIn.push(theme);
      }
    });
  }

  // For colors, we want to show the base (light) value, not the CSS output which might be dark theme
  let displayValue = token.value;
  if (token.type === 'color') {
    // For colors, use the base token value (which is the light theme value)
    // The CSS output might contain the dark theme value
    displayValue = token.value;
  } else if (token.type === 'typography') {
    // For typography, use the CSS output which has resolved values
    displayValue = cssOutput?.value || token.value;
  } else {
    // For other types, use CSS output if available
    displayValue = cssOutput?.value || token.value;
  }

  // For certain types, we might need to format the value
  let formattedValue = displayValue;
  if (
    token.type === 'dimension' &&
    typeof displayValue === 'object' &&
    displayValue.value !== undefined
  ) {
    formattedValue = `${displayValue.value}${displayValue.unit || 'px'}`;
  } else if (
    token.type === 'color' &&
    typeof displayValue === 'object' &&
    displayValue.components
  ) {
    // Format color object to CSS string
    const { components, alpha = 1 } = displayValue;
    if (components && components.length >= 3) {
      const [r, g, b] = components.map((c: number) => Math.round(c * 255));
      formattedValue = alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
    }
  } else if (token.type === 'typography' && typeof displayValue === 'object') {
    // For typography tokens, we'll keep the object but ensure values are resolved
    formattedValue = {};
    for (const [key, value] of Object.entries(displayValue)) {
      if (typeof value === 'object' && value !== null && 'value' in value) {
        // Resolve nested objects
        formattedValue[key] = value.value;
      } else {
        formattedValue[key] = value;
      }
    }
  }

  // Theme values are already properly formatted
  const finalThemeValues = { ...themeValues };

  // For typography tokens, expand into individual property tokens
  if (token.type === 'typography' && typeof formattedValue === 'object') {
    // Only expand system and component typography tokens, not reference tokens
    if (!token.id.startsWith('ref.')) {
      const typographyTokens: TokenInfo[] = [];
      const baseId = token.id;
      const baseCssVar = token.id.replace(/\./g, '-');

      // Create individual tokens for each typography property
      const properties = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];

      properties.forEach((prop) => {
        if (formattedValue[prop] !== undefined) {
          const propKebab = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

          // Get the actual value, resolving any objects
          let propValue = formattedValue[prop];

          // If it's an object with a value property, extract it
          if (typeof propValue === 'object' && propValue !== null && 'value' in propValue) {
            propValue = propValue.value;
          }

          // For fontFamily, ensure it's properly formatted
          if (prop === 'fontFamily' && Array.isArray(propValue)) {
            propValue = propValue.join(', ');
          }

          // For dimension properties (fontSize, lineHeight), ensure they have units
          if ((prop === 'fontSize' || prop === 'lineHeight') && typeof propValue === 'number') {
            propValue = `${propValue}px`;
          }

          // Determine the token type based on the property
          let tokenType = 'string';
          if (prop === 'fontSize' || prop === 'lineHeight') {
            tokenType = 'dimension';
          } else if (prop === 'fontWeight') {
            tokenType = 'fontWeight';
          } else if (prop === 'fontFamily') {
            tokenType = 'fontFamily';
          }

          const cssVar = `--${baseCssVar}-${propKebab}`;
          const jsonPath = `${baseId}.${prop}`;
          const jsFlat = `${baseId}.${prop}`
            .split('.')
            .map((part, index) =>
              index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
            )
            .join('');

          const usage: TokenUsage[] = [
            { label: 'CSS', value: cssVar },
            { label: 'JSON', value: jsonPath },
            { label: 'JS', value: jsFlat },
          ];

          typographyTokens.push({
            name: `${name}-${propKebab}`,
            path: `${baseId}.${prop}`,
            type: tokenType,
            description: '',
            originalValue: formattedValue[prop],
            value: propValue,
            usage,
            hasReferences: false,
            references: [],
            expandedValue: propValue,
          });
        }
      });

      return typographyTokens;
    }
  }

  const cssVar = cssOutput?.name || `--${token.id.replace(/\./g, '-')}`;
  const jsonPath = token.id;
  const jsFlat = token.id
    .split('.')
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');

  const usage: TokenUsage[] = [
    { label: 'CSS', value: cssVar },
    { label: 'JSON', value: jsonPath },
    { label: 'JS', value: jsFlat },
  ];

  return {
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
    themeValues: Object.keys(finalThemeValues).length > 0 ? finalThemeValues : undefined,
    isThemeable: overriddenIn.length > 0,
    overriddenIn: overriddenIn.length > 0 ? overriddenIn : undefined,
  };
}

/**
 * Flatten nested registry tokens into a flat array
 */
export function flattenRegistryTokens(obj: any, path: string[] = []): RegistryToken[] {
  const results: RegistryToken[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = [...path, key];

    // Check if this is a token (has an id property)
    if (value && typeof value === 'object' && 'id' in value) {
      results.push(value as RegistryToken);
    } else if (value && typeof value === 'object') {
      // Recurse into nested objects
      results.push(...flattenRegistryTokens(value, currentPath));
    }
  });

  return results;
}

/**
 * Group flat tokens by category
 */
export function groupTokensByCategory(tokens: RegistryToken[]): Record<string, TokenInfo[]> {
  const grouped: Record<string, TokenInfo[]> = {};

  tokens.forEach((token) => {
    const parts = token.id.split('.');
    // Category is the second part (e.g., ref.color.blue -> color)
    const category = parts.length > 1 ? parts[1] : 'other';

    if (!category) return; // Skip if no category

    if (!grouped[category]) {
      grouped[category] = [];
    }

    const tokenInfo = registryTokenToTokenInfo(token);
    const categoryTokens = grouped[category];
    if (!categoryTokens) return; // This should never happen, but satisfies TypeScript

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
  });

  return grouped;
}
