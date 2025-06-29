/**
 * Format color value from DTCG format to rgba string
 *
 * DTCG colors are objects with components array [r, g, b] as 0-1 values
 * and optional alpha (default 1)
 *
 * @param {Object} color - DTCG color object
 * @param {Array<number>} color.components - RGB values as 0-1
 * @param {number} [color.alpha=1] - Alpha value as 0-1
 * @returns {string|*} CSS rgba() string, or original value if not a valid color object
 */
export function formatColor(color) {
  if (!color?.components) return color;

  const { components, alpha = 1 } = color;
  const [r, g, b] = components;

  const red = Math.round(r * 255);
  const green = Math.round(g * 255);
  const blue = Math.round(b * 255);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
