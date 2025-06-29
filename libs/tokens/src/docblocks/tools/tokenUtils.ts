/**
 * Extract box shadow value from token value
 */
export const extractBoxShadowValue = (value: unknown): string => {
  if (typeof value === 'object' && value !== null && 'boxShadow' in value) {
    return (value as { boxShadow: string }).boxShadow;
  }
  return typeof value === 'string' ? value : 'N/A';
};
