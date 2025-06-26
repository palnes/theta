import { formatColor } from './color.js';

/**
 * Format a dimension value for CSS
 */
export function formatDimension(value) {
  // Handle dimension object {value: 10, unit: "px"}
  if (value?.value !== undefined && value?.unit !== undefined) {
    return `${value.value}${value.unit}`;
  }

  // Handle plain number
  if (typeof value === 'number') {
    return `${value}px`;
  }

  // String or other
  return String(value);
}

/**
 * Format an array value for CSS (font families, etc.)
 */
export function formatArray(value) {
  if (!Array.isArray(value)) {
    return String(value);
  }

  return (
    value
      .filter((v) => v && (typeof v === 'string' ? v.trim() : true))
      .map((v) => {
        // Wrap font names with spaces in quotes
        if (typeof v === 'string' && v.includes(' ')) {
          return `"${v}"`;
        }
        return String(v);
      })
      .join(', ') || 'initial'
  );
}

/**
 * Format font family value for CSS
 */
export function formatFontFamily(value) {
  return formatArray(value);
}

/**
 * Format line height value for CSS
 */
export function formatLineHeight(value) {
  // Handle dimension object
  if (value?.value !== undefined && value?.unit !== undefined) {
    return `${value.value}${value.unit}`;
  }

  // Unitless multiplier (like 1.5)
  if (typeof value === 'number' && value < 10) {
    return String(value);
  }

  // Pixel value
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return String(value);
}

/**
 * Format a single shadow for CSS
 */
export function formatSingleShadow(shadow) {
  if (!shadow || typeof shadow !== 'object') {
    return 'none';
  }

  const parts = [];

  if (shadow.offsetX !== undefined) {
    parts.push(formatDimension(shadow.offsetX));
  }
  if (shadow.offsetY !== undefined) {
    parts.push(formatDimension(shadow.offsetY));
  }
  if (shadow.blur !== undefined) {
    parts.push(formatDimension(shadow.blur));
  }
  if (shadow.spread !== undefined) {
    parts.push(formatDimension(shadow.spread));
  }
  if (shadow.color) {
    parts.push(formatColor(shadow.color));
  }

  return parts.length ? parts.join(' ') : 'none';
}

/**
 * Format shadow value(s) for CSS
 */
export function formatShadow(value) {
  if (Array.isArray(value)) {
    return value.map(formatSingleShadow).join(', ');
  }
  return formatSingleShadow(value);
}

/**
 * Check if a value is a shadow array
 */
export function isShadowArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0].offsetX !== undefined
  );
}
