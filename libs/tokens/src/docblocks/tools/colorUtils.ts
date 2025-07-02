import { COLOR_DISPLAY } from '../constants/displayConstants';
import type { TokenInfo } from '../types/tokenReferenceTable';

export interface ColorToken {
  name: string;
  value: string;
  usage: Array<{ label: string; value: string }>;
  path?: string;
  type?: string;
  themeValues?: Record<string, string>;
  isThemeable?: boolean;
  overriddenIn?: string[];
}

/**
 * Convert TokenInfo to ColorToken format for backward compatibility
 */
export function tokenInfoToColorToken(token: TokenInfo): ColorToken {
  return {
    name: token.name,
    value: token.value,
    usage: token.usage,
    path: token.path,
    type: token.type,
    themeValues: token.themeValues,
    isThemeable: token.isThemeable,
    overriddenIn: token.overriddenIn,
  };
}

export interface GroupedTokens {
  [key: string]: ColorToken[];
}

/**
 * Get the background style for color swatches, handling transparent colors
 */
export const getColorBackgroundStyle = (token: ColorToken): string => {
  // Check if this is transparent (by name or value)
  if (
    token.name.toLowerCase().includes('transparent') ||
    token.value === 'transparent' ||
    token.value === 'rgba(0, 0, 0, 0)'
  ) {
    return `repeating-linear-gradient(${COLOR_DISPLAY.transparentGradient.angle}, var(--sys-color-surface-secondary-default), var(--sys-color-surface-secondary-default) ${COLOR_DISPLAY.transparentGradient.size1}, var(--sys-color-surface-primary-default) ${COLOR_DISPLAY.transparentGradient.size1}, var(--sys-color-surface-primary-default) ${COLOR_DISPLAY.transparentGradient.size2})`;
  }
  return token.value;
};

/**
 * Extract display name from token path or name
 */
// Helper to handle name-only tokens
const getDisplayNameFromName = (name: string): { main: string; sub: string | null } => {
  // If the name already has proper casing (contains uppercase), use as-is
  if (name !== name.toLowerCase()) {
    return { main: name, sub: null };
  }
  // Otherwise, capitalize first letter
  return {
    main: name.charAt(0).toUpperCase() + name.slice(1),
    sub: null,
  };
};

// Helper to handle semantic color paths
const getDisplayNameFromSemanticPath = (
  parts: string[],
  semanticTier = 'sys'
): { main: string; sub: string | null } | null => {
  if (parts[0] !== semanticTier || parts[1] !== 'color') {
    return null;
  }

  // For paths like "sys.color.action.primary.default" (5+ parts)
  if (parts.length >= 5) {
    const category = parts[2] || null;
    const lastTwo = parts
      .slice(-2)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    return { main: lastTwo, sub: category };
  }

  // For paths like "sys.color.text.primary" (4 parts)
  if (parts.length === 4) {
    const category = parts[2] || null;
    const lastPart = parts[parts.length - 1];
    return {
      main: lastPart ? lastPart.charAt(0).toUpperCase() + lastPart.slice(1) : '',
      sub: category,
    };
  }

  return null;
};

// Helper to parse primitive token names
const getDisplayNameFromPrimitive = (name: string): { main: string; sub: string | null } => {
  const nameMatch = name.match(/([a-zA-Z]+)(\d+)?$/);
  if (nameMatch) {
    const [, colorName, shade] = nameMatch;
    return {
      main: shade ? `${colorName} ${shade}` : colorName || name,
      sub: null,
    };
  }
  return { main: name, sub: null };
};

export const getColorDisplayName = (
  token: ColorToken,
  semanticTier = 'sys'
): { main: string; sub: string | null } => {
  // Use the name property if it's already formatted (like "primary default")
  if (token.name && !token.path) {
    return getDisplayNameFromName(token.name);
  }

  // For semantic tokens with path, extract category
  if (token.path) {
    const parts = token.path.split('.');
    const semanticName = getDisplayNameFromSemanticPath(parts, semanticTier);
    if (semanticName) {
      return semanticName;
    }
  }

  // For primitive tokens, parse the name
  return getDisplayNameFromPrimitive(token.name);
};

/**
 * Group tokens by category based on their path
 */
// Helper to extract group key from token path
const getGroupKeyFromPath = (path: string | undefined): string => {
  if (!path) return 'other';

  const parts = path.split('.');

  // Not enough parts for grouping
  if (parts.length < 4) return 'other';

  const category = parts[2];

  // For status/state colors: use the 4th part
  if (category === 'status' || category === 'state') {
    return parts[3] || 'default';
  }

  // For other semantic colors with subcategory
  if (parts.length >= 5) {
    return parts[3] || 'default';
  }

  return 'other';
};

// Helper to add token to group
const addTokenToGroup = (groups: GroupedTokens, groupKey: string, token: ColorToken): void => {
  if (!groups[groupKey]) {
    groups[groupKey] = [];
  }
  groups[groupKey]?.push(token);
};

export const groupColorTokens = (
  tokens: ColorToken[],
  groupBy: 'category' | 'none'
): GroupedTokens => {
  if (groupBy === 'none') {
    return { ungrouped: tokens };
  }

  const groups: GroupedTokens = {};

  for (const token of tokens) {
    const groupKey = getGroupKeyFromPath(token.path);
    addTokenToGroup(groups, groupKey, token);
  }

  return groups;
};
