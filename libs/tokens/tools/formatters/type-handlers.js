import { formatColor } from './color.js';
import { formatShadow } from './shadow.js';
import { formatTypography } from './typography.js';

/**
 * Type handlers for different token types
 */
export const typeHandlers = {
  color: (value) => formatColor(value),

  dimension: (value) => value?.value ?? value,

  typography: (value) => formatTypography(value),

  shadow: (value) => {
    const shadows = Array.isArray(value) ? value : [value];
    const formatted = shadows.flatMap((shadow) =>
      typeof shadow === 'object' ? [formatShadow(shadow)] : []
    );
    return formatted.length === 1 ? formatted[0] : formatted;
  },

  fontFamily: (value) => value,
};
