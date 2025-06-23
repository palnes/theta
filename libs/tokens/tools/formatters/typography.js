/**
 * Format typography value
 */
export function formatTypography(value) {
  if (typeof value !== 'object') return value;
  return {
    fontFamily: value.fontFamily,
    fontSize: value.fontSize?.value ?? value.fontSize,
    fontWeight: value.fontWeight,
    lineHeight: value.lineHeight?.value ?? value.lineHeight,
  };
}
