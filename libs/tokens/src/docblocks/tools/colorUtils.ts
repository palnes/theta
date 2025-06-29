import { COLOR_DISPLAY } from '../constants/displayConstants';
import { TokenInfo } from '../types/tokenReferenceTable';

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
export const getColorDisplayName = (token: ColorToken): { main: string; sub: string | null } => {
  // Use the name property if it's already formatted (like "primary default")
  if (token.name && !token.path) {
    // If the name already has proper casing (contains uppercase), use as-is
    if (token.name !== token.name.toLowerCase()) {
      return { main: token.name, sub: null };
    }
    // Otherwise, capitalize first letter
    return { main: token.name.charAt(0).toUpperCase() + token.name.slice(1), sub: null };
  }

  // For semantic tokens with path, extract category
  if (token.path) {
    const parts = token.path.split('.');
    // For paths like "sys.color.action.primary.default"
    if (parts.length >= 5 && parts[0] === 'sys' && parts[1] === 'color') {
      const category = parts[2] || null;

      // For semantic colors with states, show the last two parts
      const lastTwo = parts
        .slice(-2)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      return { main: lastTwo, sub: category };
    }

    // For paths like "sys.color.text.primary" (without state)
    if (parts.length === 4 && parts[0] === 'sys' && parts[1] === 'color') {
      const category = parts[2] || null;
      const lastPart = parts[parts.length - 1];
      return {
        main: lastPart ? lastPart.charAt(0).toUpperCase() + lastPart.slice(1) : token.name,
        sub: category,
      };
    }
  }

  // For primitive tokens, parse the name
  const nameMatch = token.name.match(/([a-zA-Z]+)(\d+)?$/);
  if (nameMatch) {
    const [, colorName, shade] = nameMatch;
    return { main: shade ? `${colorName} ${shade}` : colorName || token.name, sub: null };
  }

  return { main: token.name, sub: null };
};

/**
 * Group tokens by category based on their path
 */
export const groupColorTokens = (
  tokens: ColorToken[],
  groupBy: 'category' | 'none'
): GroupedTokens => {
  if (groupBy === 'none') {
    return { ungrouped: tokens };
  }

  const groups: GroupedTokens = {};

  tokens.forEach((token) => {
    // Extract group from path (e.g., "sys.color.status.error.default" -> "error")
    let groupKey = 'other';

    if (token.path) {
      const parts = token.path.split('.');
      // For status colors: sys.color.status.error.default -> group by "error"
      if (parts.length >= 4 && parts[2] === 'status') {
        groupKey = parts[3] || 'default';
      }
      // For state colors: sys.color.state.info.default -> group by "info"
      else if (parts.length >= 4 && parts[2] === 'state') {
        groupKey = parts[3] || 'default';
      }
      // For other semantic colors, check if they have a subcategory
      else if (parts.length >= 5) {
        groupKey = parts[3] || 'default';
      }
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey]?.push(token);
  });

  return groups;
};
