import { formatColor } from './color.js';
import { formatShadow } from './shadow.js';
import { formatTypography } from './typography.js';

/**
 * Type handlers for different token types
 * Maps DTCG token types to formatting functions
 */
export const typeHandlers = {
  // Convert color objects to rgba strings
  color: (value) => formatColor(value),

  // Extract numeric value from dimension objects
  dimension: (value) => value?.value ?? value,

  // Format composite typography tokens
  typography: (value) => formatTypography(value),

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
