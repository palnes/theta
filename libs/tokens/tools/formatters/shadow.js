import { formatColor } from './color.js';

/**
 * Format shadow value for both web and React Native
 */
export function formatShadow(shadow) {
  const offsetX = shadow.offsetX?.value ?? shadow.offsetX ?? 0;
  const offsetY = shadow.offsetY?.value ?? shadow.offsetY ?? 0;
  const blur = shadow.blur?.value ?? shadow.blur ?? 0;
  const spread = shadow.spread?.value ?? shadow.spread ?? 0;
  const color = formatColor(shadow.color);

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: 1,
    shadowRadius: blur / 2, // React Native uses different blur calculation
    boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`,
  };
}
