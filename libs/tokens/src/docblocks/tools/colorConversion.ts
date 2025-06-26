import parse from 'color-parse';

export interface DTCGColor {
  colorSpace: string;
  components: [number, number, number];
  alpha: number;
}

export interface ColorConversionResult {
  success: boolean;
  color?: DTCGColor;
  error?: string;
  formats?: {
    hex: string;
    rgb: string;
    rgba: string;
    dtcgString: string;
  };
}

/**
 * Convert a color string to DTCG format
 */
export function convertToDTCGColor(colorString: string): ColorConversionResult {
  const trimmed = colorString.trim();

  if (!trimmed) {
    return { success: false, error: 'Please enter a color value' };
  }

  try {
    const parsed = parse(trimmed);

    if (!parsed?.values || parsed.values.length < 3) {
      return { success: false, error: 'Invalid color format' };
    }

    let r: number;
    let g: number;
    let b: number;
    const alpha = parsed.alpha ?? 1;

    // If it's already RGB, use the values directly
    if (parsed.space === 'rgb' || !parsed.space) {
      [r, g, b] = parsed.values as [number, number, number];
    } else {
      return {
        success: false,
        error:
          'Currently only RGB-based colors are supported. Please use hex, rgb, or rgba formats.',
      };
    }

    // Convert to DTCG format
    const dtcgColor: DTCGColor = {
      colorSpace: 'srgb',
      components: [
        Math.round((r / 255) * 1000) / 1000,
        Math.round((g / 255) * 1000) / 1000,
        Math.round((b / 255) * 1000) / 1000,
      ],
      alpha: Math.round(alpha * 1000) / 1000,
    };

    // Generate various formats
    const hex = `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    const dtcgString = JSON.stringify(dtcgColor, null, 2);

    return {
      success: true,
      color: dtcgColor,
      formats: { hex, rgb, rgba, dtcgString },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse color. Please check the format and try again.',
    };
  }
}

/**
 * Convert DTCG color back to CSS formats
 */
export function dtcgToCSS(dtcg: DTCGColor): ColorConversionResult['formats'] {
  const [r, g, b] = dtcg.components.map((c) => Math.round(c * 255));
  const alpha = dtcg.alpha;

  const hex =
    alpha === 1
      ? `#${componentToHex(r ?? 0)}${componentToHex(g ?? 0)}${componentToHex(b ?? 0)}`
      : `#${componentToHex(r ?? 0)}${componentToHex(g ?? 0)}${componentToHex(b ?? 0)}${componentToHex(Math.round(alpha * 255))}`;

  const rgb = `rgb(${r}, ${g}, ${b})`;
  const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  const dtcgString = JSON.stringify(dtcg, null, 2);

  return { hex, rgb, rgba, dtcgString };
}

/**
 * Helper to convert number to hex
 */
function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

/**
 * Validate if a string is a valid color
 */
export function isValidColor(colorString: string): boolean {
  try {
    const parsed = parse(colorString.trim());
    return !!(parsed?.values && parsed.values.length >= 3);
  } catch {
    return false;
  }
}
