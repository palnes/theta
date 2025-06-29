/**
 * CSS Formatter Functions
 *
 * This file contains functions to format token values for CSS output.
 * Each function handles a specific type of value and converts it to
 * valid CSS syntax.
 */

import { formatColor } from './color.js';

/**
 * Process dimension value - extract numeric value or format with unit
 *
 * Dimensions can be:
 * - Objects: {value: 10, unit: "px"} → "10px" or 10
 * - Numbers: 10 → 10
 * - Strings: "10px" → "10px"
 *
 * @param {Object|number|string} dimension - Dimension value
 * @param {boolean} extractOnly - If true, return numeric value only
 * @returns {number|string} Processed dimension
 */
export function processDimension(dimension, extractOnly = false) {
  if (dimension?.value !== undefined && dimension?.unit !== undefined) {
    return extractOnly ? dimension.value : `${dimension.value}${dimension.unit}`;
  }
  return dimension;
}

/**
 * Format a dimension value for CSS
 * @param {Object|number|string} value - Dimension value
 * @returns {string} CSS-formatted dimension (e.g., "10px")
 */
export function formatDimension(value) {
  // Handle dimension object {value: 10, unit: "px"}
  const formatted = processDimension(value);

  // Handle plain number
  if (typeof formatted === 'number') {
    return `${formatted}px`;
  }

  // String or other
  return String(formatted);
}

/**
 * Format an array value for CSS (font families, etc.)
 * @param {Array|*} value - Array value to format
 * @returns {string} CSS-formatted list (e.g., "Arial, sans-serif")
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
 * Format line height value for CSS
 * @param {Object|number|string} value - Line height value
 * @returns {string} CSS line height value
 */
export function formatLineHeight(value) {
  // Handle dimension object
  const formatted = processDimension(value);

  // Unitless multiplier (like 1.5)
  if (typeof formatted === 'number' && formatted < 10) {
    return String(formatted);
  }

  // Pixel value
  if (typeof formatted === 'number') {
    return `${formatted}px`;
  }

  return String(formatted);
}

/**
 * Format a single shadow for CSS
 * @private
 * @param {Object} shadow - Shadow object
 * @returns {string} CSS shadow value or 'none'
 */
function formatSingleShadow(shadow) {
  if (!shadow || typeof shadow !== 'object') {
    return 'none';
  }

  const shadowProperties = ['offsetX', 'offsetY', 'blur', 'spread'];
  const parts = shadowProperties
    .filter((prop) => shadow[prop] !== undefined)
    .map((prop) => formatDimension(shadow[prop]));

  if (shadow.color) {
    parts.push(formatColor(shadow.color));
  }

  return parts.length ? parts.join(' ') : 'none';
}

/**
 * Format shadow value(s) for CSS
 * @param {Object|Array<Object>} value - Shadow object or array of shadows
 * @returns {string} CSS box-shadow value
 */
export function formatShadow(value) {
  if (Array.isArray(value)) {
    return value.map(formatSingleShadow).join(', ');
  }
  return formatSingleShadow(value);
}

/**
 * Check if a value is a shadow array
 * @param {*} value - Value to check
 * @returns {boolean} True if value is an array of shadow objects
 */
export function isShadowArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0].offsetX !== undefined
  );
}
