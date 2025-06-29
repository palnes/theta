import { formatColor } from './color.js';
import { processDimension } from './css.js';

/**
 * Format shadow value for both web and React Native
 *
 * @param {Object} shadow - Shadow token value
 * @param {Object|number} shadow.offsetX - Horizontal offset (can be dimension object or number)
 * @param {Object|number} shadow.offsetY - Vertical offset (can be dimension object or number)
 * @param {Object|number} shadow.blur - Blur radius (can be dimension object or number)
 * @param {Object|number} shadow.spread - Spread radius (can be dimension object or number)
 * @param {Object} shadow.color - Shadow color in DTCG format
 * @returns {Object} Formatted shadow
 * @returns {string} returns.shadowColor - React Native shadow color
 * @returns {Object} returns.shadowOffset - React Native shadow offset {width, height}
 * @returns {number} returns.shadowOpacity - React Native shadow opacity
 * @returns {number} returns.shadowRadius - React Native shadow radius
 * @returns {string} returns.boxShadow - CSS box-shadow value
 */
export function formatShadow(shadow) {
  // Extract numeric values from dimension objects or use raw numbers
  const offsetX = processDimension(shadow.offsetX, true) ?? 0;
  const offsetY = processDimension(shadow.offsetY, true) ?? 0;
  const blur = processDimension(shadow.blur, true) ?? 0;
  const spread = processDimension(shadow.spread, true) ?? 0;
  const color = formatColor(shadow.color);

  return {
    // React Native shadow properties
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: 1,
    shadowRadius: blur / 2, // React Native uses different blur calculation

    // CSS box-shadow for web
    boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`,
  };
}
