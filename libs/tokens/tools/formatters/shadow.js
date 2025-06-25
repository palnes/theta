import { formatColor } from './color.js';

/**
 * Format shadow value for both web and React Native
 *
 * @param {Object} shadow - Shadow token value
 * @param {Object|number} shadow.offsetX - Horizontal offset (can be dimension object or number)
 * @param {Object|number} shadow.offsetY - Vertical offset (can be dimension object or number)
 * @param {Object|number} shadow.blur - Blur radius (can be dimension object or number)
 * @param {Object|number} shadow.spread - Spread radius (can be dimension object or number)
 * @param {Object|string} shadow.color - Shadow color
 * @returns {Object} Formatted shadow with both React Native and CSS properties
 */
export function formatShadow(shadow) {
  // Extract numeric values from dimension objects or use raw numbers
  const offsetX = shadow.offsetX?.value ?? shadow.offsetX ?? 0;
  const offsetY = shadow.offsetY?.value ?? shadow.offsetY ?? 0;
  const blur = shadow.blur?.value ?? shadow.blur ?? 0;
  const spread = shadow.spread?.value ?? shadow.spread ?? 0;
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
