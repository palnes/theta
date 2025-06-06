import StyleDictionary from 'style-dictionary';

// Register custom transform for DTCG color format
StyleDictionary.registerTransform({
  name: 'dtcg/color',
  type: 'value',
  transitive: false,
  filter: (token) => token.$type === 'color',
  transform: (token) => {
    const value = token.$value || token.value;

    // If no value, return fallback
    if (!value) return token.value;

    // Handle simple string values (already processed colors)
    if (typeof value === 'string') return value;

    // Handle DTCG color object format
    if (typeof value === 'object') {
      const { colorSpace, hex, components, alpha } = value;

      // Prefer hex if available
      if (hex) {
        if (alpha && alpha < 1) {
          const a = Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0');
          return hex + a;
        }
        return hex;
      }

      // Handle sRGB color space
      if (colorSpace === 'srgb' && components?.length === 3) {
        const [red, green, blue] = components;
        if (red !== undefined && green !== undefined && blue !== undefined) {
          const sRGBtoRGB = (num) => {
            const result = Math.round(num * 255);
            return result.toString(16).padStart(2, '0');
          };

          const hexColor = `#${sRGBtoRGB(red)}${sRGBtoRGB(green)}${sRGBtoRGB(blue)}`;

          if (alpha && alpha < 1) {
            const a = Math.round(alpha * 255)
              .toString(16)
              .padStart(2, '0');
            return hexColor + a;
          }

          return hexColor;
        }
      }
    }

    // Return the original token value if we can't transform it
    return token.value;
  },
});
