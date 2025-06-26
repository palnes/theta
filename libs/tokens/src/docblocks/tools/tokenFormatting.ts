import type { TokenValue } from '../types/tokens';

/**
 * Format token values for display
 */
export function formatTokenValue(value: TokenValue, type?: string): string {
  if (typeof value === 'object' && value !== null) {
    // For shadow objects, extract key values
    if (type === 'shadow') {
      if ('shadowColor' in value) {
        return `${(value as any).shadowRadius || 0}px blur`;
      }
      if ('boxShadow' in value) {
        return String(value.boxShadow);
      }
    }
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Parse shadow value from various formats
 */
export function parseShadowValue(value: TokenValue): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    if ('boxShadow' in value) {
      return String(value.boxShadow);
    }

    // Handle array of shadows
    if (Array.isArray(value)) {
      return value
        .map((shadow) => {
          if (typeof shadow === 'string') return shadow;
          if (shadow.boxShadow) return String(shadow.boxShadow);
          const { x = 0, y = 0, blur = 0, spread = 0, color = '#000' } = shadow;
          return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
        })
        .join(', ');
    }

    // Handle single shadow object
    const { x = 0, y = 0, blur = 0, spread = 0, color = '#000' } = value as any;
    return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }

  return '';
}

/**
 * Check if two token values are different
 */
export function areTokenValuesDifferent(value1: TokenValue, value2: TokenValue): boolean {
  return JSON.stringify(value1) !== JSON.stringify(value2);
}

/**
 * Get appropriate preview component based on token type
 */
export function getTokenPreviewType(type?: string): string {
  switch (type) {
    case 'color':
      return 'color';
    case 'dimension':
    case 'spacing':
      return 'spacing';
    case 'shadow':
      return 'shadow';
    case 'radius':
      return 'radius';
    case 'typography':
    case 'fontFamily':
    case 'fontSize':
    case 'fontWeight':
    case 'lineHeight':
      return 'typography';
    default:
      return 'text';
  }
}
