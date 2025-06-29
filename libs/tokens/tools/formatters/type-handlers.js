import { formatColor } from './color.js';
import { processDimension } from './css.js';
import { formatShadow } from './shadow.js';

/**
 * Type handlers for different token types
 * Maps DTCG token types to formatting functions
 *
 * @type {Object.<string, Function>}
 * @property {Function} color - Formats color tokens to rgba strings
 * @property {Function} dimension - Extracts numeric values from dimension tokens
 * @property {Function} typography - Formats typography composite tokens
 * @property {Function} shadow - Formats shadow tokens (single or array)
 * @property {Function} fontFamily - Pass-through for font family arrays
 */
export const typeHandlers = {
  // Convert color objects to rgba strings
  color: (value) => formatColor(value),

  // Extract numeric value from dimension objects
  dimension: (value) => processDimension(value, true),

  // Format composite typography tokens
  typography: (value) => {
    if (typeof value !== 'object') return value;
    return {
      fontFamily: value.fontFamily,
      fontSize: processDimension(value.fontSize, true),
      fontWeight: value.fontWeight,
      lineHeight: processDimension(value.lineHeight, true),
    };
  },

  // Handle single shadows or arrays of shadows
  shadow: (value) => {
    const shadows = Array.isArray(value) ? value : [value];
    const formatted = shadows.flatMap((shadow) =>
      typeof shadow === 'object' ? [formatShadow(shadow)] : []
    );
    // Return single shadow object or array if multiple
    return formatted.length === 1 ? formatted[0] : formatted;
  },

  // Pass through font family arrays unchanged
  fontFamily: (value) => value,
};
