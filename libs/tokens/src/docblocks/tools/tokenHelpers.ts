import { TokenInfo } from '../types/tokenReferenceTable';
import type { TokenUsage } from '../types/tokenReferenceTable';
import type { NumericToken, StringToken } from '../types/tokens';

/**
 * Extract dimension tokens and convert to numeric values
 */
export const extractDimensions = (tokens: TokenInfo[]): NumericToken[] => {
  return tokens
    .filter((token) => {
      const isMax = token.name.toLowerCase().includes('max');
      // Check if the name is a number or contains a number
      const hasNumber = /^\d+$/.test(token.name) || /\d+$/.test(token.name);
      return hasNumber && !isMax;
    })
    .map((token) => {
      const isNegative = token.name.toLowerCase().includes('neg');
      // Extract number from name - could be just a number or end with a number
      const match = token.name.match(/(\d+)$/);
      const numericKey = match ? match[1] : token.name;
      const absoluteValue = Number.parseInt(numericKey || '0');

      // Parse the actual pixel value from the token value
      let pixelValue = absoluteValue;
      if (typeof token.value === 'string' && token.value.includes('px')) {
        // parseInt handles negative values correctly, so just parse the value as-is
        pixelValue = Number.parseInt(token.value.replace('px', '')) || absoluteValue;
      }

      return {
        value: pixelValue, // Use the parsed value directly, don't apply negative twice
        tokenValue: token.value !== null && token.value !== undefined ? String(token.value) : '0',
        key: isNegative ? `neg${numericKey}` : numericKey || '',
        usage: token.usage,
      };
    })
    .sort((a, b) => a.value - b.value);
};

/**
 * Extract special dimension tokens (e.g., max values)
 */
export const extractSpecialDimensions = (tokens: TokenInfo[]): StringToken[] => {
  return tokens
    .filter((token) => token.name.toLowerCase() === 'refdimensionmax')
    .map((token) => ({
      key: token.path.split('.').pop() || token.name,
      value: String(token.value),
      tokenValue: token.value !== null && token.value !== undefined ? `${token.value}px` : '0px',
      usage: token.usage,
    }));
};

/**
 * Get semantic spacing tokens in logical order
 */
export const getSemanticSpacing = (tokens: TokenInfo[]): StringToken[] => {
  const order = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

  return tokens
    .map((token) => {
      const pathParts = token.path?.split('.') || [];
      const key = pathParts[pathParts.length - 1] || '';

      return {
        key,
        tokenValue: token.value !== null && token.value !== undefined ? String(token.value) : '0',
        value: token.value,
        usage: token.usage,
      };
    })
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key || '');
      const bIndex = order.indexOf(b.key || '');
      if (aIndex === -1 && bIndex === -1) {
        const aNum = Number.parseInt(a.key || '');
        const bNum = Number.parseInt(b.key || '');
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
        return (a.key || '').localeCompare(b.key || '');
      }
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
};

/**
 * Get semantic radius tokens in logical order
 */
export const getSemanticRadius = (tokens: TokenInfo[]): StringToken[] => {
  const order = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

  return tokens
    .map((token) => {
      const pathParts = token.path?.split('.') || [];
      const key = pathParts[pathParts.length - 1] || '';

      return {
        key,
        tokenValue: token.value !== null && token.value !== undefined ? String(token.value) : '0',
        value: token.value,
        usage: token.usage,
      };
    })
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key || '');
      const bIndex = order.indexOf(b.key || '');
      if (aIndex === -1 && bIndex === -1) return a.key.localeCompare(b.key);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
};

/**
 * Get semantic z-index tokens sorted by value
 */
export const getSemanticZIndex = (
  tokens: TokenInfo[]
): Array<{ key: string; value: number; usage: TokenUsage[] }> => {
  return tokens
    .map((token) => {
      const pathParts = token.path?.split('.') || [];
      const key = pathParts[pathParts.length - 1] || '';

      return {
        key,
        value: token.value,
        usage: token.usage,
      };
    })
    .sort((a, b) => a.value - b.value);
};

/**
 * Get semantic borders grouped by type
 */
export const getSemanticBorders = (
  tokens: TokenInfo[]
): { width: TokenInfo[]; style: TokenInfo[] } => {
  const grouped: { width: TokenInfo[]; style: TokenInfo[] } = {
    width: [],
    style: [],
  };

  tokens.forEach((token) => {
    const pathParts = token.path?.split('.') || [];
    // Check for sys.border.width.* or sys.border.style.*
    if (pathParts[0] === 'sys' && pathParts[1] === 'border' && pathParts.length >= 4) {
      const type = pathParts[2]; // 'width' or 'style'

      if (type && (type === 'width' || type === 'style')) {
        grouped[type].push(token);
      }
    }
  });

  return grouped;
};

/**
 * Format font family value for display
 */
export const formatFontFamilyValue = (
  value: string | string[] | Record<string, unknown>
): string => {
  return Array.isArray(value)
    ? value.join(', ')
    : typeof value === 'object'
      ? 'Custom font object'
      : value;
};
