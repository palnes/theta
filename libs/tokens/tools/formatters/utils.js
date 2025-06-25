/**
 * Convert dot notation to camelCase
 *
 * @example
 * toCamelCase('cmp.button.paddingX') // 'cmpButtonPaddingX'
 * toCamelCase('sys.color.text.primary') // 'sysColorTextPrimary'
 */
export function toCamelCase(dotNotation) {
  return dotNotation
    .split('.')
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
}

/**
 * Set nested value in object using dot notation path
 * Creates intermediate objects as needed
 *
 * @example
 * const obj = {};
 * setNestedValue(obj, 'sys.color.primary', '#000');
 * // obj = { sys: { color: { primary: '#000' } } }
 */
export function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  // Create nested structure
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  // Set the final value
  current[keys[keys.length - 1]] = value;
}
