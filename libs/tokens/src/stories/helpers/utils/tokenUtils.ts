/**
 * Create token formats object for TokenFormatDisplay
 */
export const createTokenFormats = (
  cssVariable: string,
  jsPath: string | undefined,
  key: string | undefined,
  tokenType: string,
  jsFlat?: string
) => {
  const jsonPath = jsPath || `sys.${tokenType}.${key}`;

  return {
    css: cssVariable,
    json: jsonPath,
    js: jsFlat || jsPath || '',
  };
};

/**
 * Extract box shadow value from token value
 */
export const extractBoxShadowValue = (value: unknown): string => {
  if (typeof value === 'object' && value !== null && 'boxShadow' in value) {
    return (value as { boxShadow: string }).boxShadow;
  }
  return typeof value === 'string' ? value : 'N/A';
};
