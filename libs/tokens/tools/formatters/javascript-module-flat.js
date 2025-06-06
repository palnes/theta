import StyleDictionary from 'style-dictionary';

// Custom format for JS/TS that extracts values properly
StyleDictionary.registerFormat({
  name: 'javascript/module-flat',
  format: ({ dictionary }) => {
    const tokens = {};

    dictionary.allTokens.forEach((token) => {
      const value = token.$value !== undefined ? token.$value : token.value;

      // For dimensions in JS/TS, we need numeric values without units
      if (token.$type === 'dimension') {
        // If it's a string like "16px", extract the number
        if (typeof value === 'string') {
          // Handle negative values
          const match = value.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%)?$/);
          if (match) {
            tokens[token.name] = Number.parseFloat(match[1]);
          } else {
            tokens[token.name] = value;
          }
        } else if (typeof value === 'object' && value.value !== undefined) {
          tokens[token.name] = value.value;
        } else {
          tokens[token.name] = value;
        }
      }
      // For colors, use the transformed hex value
      else if (token.$type === 'color') {
        tokens[token.name] = value;
      }
      // For typography, keep the object but ensure dimensions are numeric
      else if (token.$type === 'typography' && typeof value === 'object') {
        const typography = { ...value };
        if (typography.fontSize && typeof typography.fontSize === 'string') {
          typography.fontSize = Number.parseFloat(typography.fontSize);
        }
        if (typography.letterSpacing && typeof typography.letterSpacing === 'string') {
          typography.letterSpacing = Number.parseFloat(typography.letterSpacing);
        }
        tokens[token.name] = typography;
      }
      // For shadows, the value should already be in React Native format from our transform
      else if (token.$type === 'shadow') {
        tokens[token.name] = value;
      }
      // For everything else, use the value as-is
      else {
        tokens[token.name] = value;
      }
    });

    return `/**
 * Do not edit directly, this file was auto-generated.
 */

export const tokens = ${JSON.stringify(tokens, null, 2)};
`;
  },
});
