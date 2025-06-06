import StyleDictionary from 'style-dictionary';

// Register custom transform for DTCG dimension format (with units for CSS)
StyleDictionary.registerTransform({
  name: 'dtcg/dimension',
  type: 'value',
  transitive: false,
  filter: (token) => token.$type === 'dimension',
  transform: (token, platform) => {
    const value = token.$value !== undefined ? token.$value : token.value;

    // Handle null/undefined values
    if (value == null) return 0;

    // Handle DTCG dimension format when value is an object
    if (typeof value === 'object' && value !== null) {
      const { unit, value: val } = value;
      if (typeof unit === 'string' && typeof val === 'number') {
        // Convert rem to px if basePxFontSize is configured
        const basePxFontSize = platform?.basePxFontSize || 16;
        return unit === 'rem' ? `${val * basePxFontSize}px` : `${val}${unit}`;
      }
    }

    // If it's already a string or number, return as-is
    return value;
  },
});

// Register custom transform for DTCG dimension format without units (for JS/JSON)
StyleDictionary.registerTransform({
  name: 'dtcg/dimension/unitless',
  type: 'value',
  transitive: false,
  filter: (token) => token.$type === 'dimension',
  transform: (token, platform) => {
    const value = token.$value !== undefined ? token.$value : token.value;

    // Handle null/undefined values
    if (value == null) return 0;

    // Handle DTCG dimension format when value is an object
    if (typeof value === 'object' && value !== null) {
      const { unit, value: val } = value;
      if (typeof unit === 'string' && typeof val === 'number') {
        // Convert rem to px value if needed
        const basePxFontSize = platform?.basePxFontSize || 16;
        return unit === 'rem' ? val * basePxFontSize : val;
      }
    }

    // If it's already a number, return as-is
    if (typeof value === 'number') return value;

    // If it's a string with units, extract the number
    if (typeof value === 'string') {
      const match = value.match(/^(-?\d+(?:\.\d+)?)/);
      if (match) {
        return Number.parseFloat(match[1]);
      }
    }

    return value;
  },
});
