/**
 * Format color value from Terrazzo format to rgba string
 */
export function formatColor(color) {
  if (typeof color === 'string') return color;
  if (typeof color === 'object' && 'components' in color) {
    const { components, alpha = 1 } = color;
    if (components?.length === 3) {
      const [r, g, b] = components;
      const red = Math.round(r * 255);
      const green = Math.round(g * 255);
      const blue = Math.round(b * 255);
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
  }
  return color;
}
