/**
 * Convert rem values to pixels for React Native
 * Assumes 16px base font size
 */
export function remToPx(remValue: string | number): number {
  if (typeof remValue === 'number') {
    return remValue;
  }
  const rem = Number.parseFloat(remValue);
  return rem * 16;
}

/**
 * Parse spacing tokens (removes 'px' suffix if present)
 */
export function parseSpacing(value: string): number {
  return Number.parseInt(value.replace('px', ''));
}
