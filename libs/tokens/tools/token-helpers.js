/**
 * Token Helper Functions
 *
 * This file contains utilities for working with design tokens:
 * - Extracting references from token values
 * - Comparing token values
 * - Building nested structures from flat token maps
 */

/**
 * Extract all token references from a value (string or object)
 * @param {string|Object} value - Value to extract references from
 * @returns {Set<string>} Set of token IDs referenced
 */
export function extractAllReferences(value) {
  const references = new Set();

  if (typeof value === 'string') {
    const matches = value.match(/\{([^}]+)\}/g);
    if (matches) {
      for (const match of matches) {
        references.add(match.slice(1, -1));
      }
    }
  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    for (const val of Object.values(value)) {
      for (const ref of extractAllReferences(val)) {
        references.add(ref);
      }
    }
  }

  return references;
}

/**
 * Compare token values for equality
 *
 * Uses JSON.stringify for deep comparison of objects and arrays.
 * This ensures theme overrides are properly detected.
 *
 * @param {*} value1 - First value to compare
 * @param {*} value2 - Second value to compare
 * @returns {boolean} True if values are equal
 */
export function areTokenValuesEqual(value1, value2) {
  return JSON.stringify(value1) === JSON.stringify(value2);
}

/**
 * Build nested object structure from dot notation paths
 * @param {Object} items - Flat object with dot notation keys
 * @param {Function} getValue - Function to extract value from item (default: identity)
 * @returns {Object} Nested object structure
 * @example
 * buildNestedStructure({'a.b.c': 1, 'a.b.d': 2}) // {a: {b: {c: 1, d: 2}}}
 */
export function buildNestedStructure(items, getValue = (item) => item) {
  const nested = {};

  for (const [path, item] of Object.entries(items)) {
    const parts = path.split('.');
    let current = nested;

    // Build nested path
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    // Set value at final path
    current[parts[parts.length - 1]] = getValue(item);
  }

  return nested;
}
