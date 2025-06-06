import StyleDictionary from 'style-dictionary';

// Register custom format for CSS with typography expansion
StyleDictionary.registerFormat({
  name: 'css/expanded',
  format: ({ dictionary, options = {} }) => {
    const { outputReferences = false, selector = ':root' } = options;

    const tokens = dictionary.allTokens
      .map((token) => {
        const name = token.path.join('-').toLowerCase();

        // Handle typography tokens specially
        if (token.$type === 'typography' && typeof (token.$value || token.value) === 'object') {
          const value = token.$value || token.value;
          const properties = [];

          if (value.fontFamily) {
            const fontFamily = Array.isArray(value.fontFamily)
              ? value.fontFamily.map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ')
              : value.fontFamily;
            properties.push(`--${name}-font-family: ${fontFamily}`);
          }
          if (value.fontSize) properties.push(`--${name}-font-size: ${value.fontSize}`);
          if (value.fontWeight) properties.push(`--${name}-font-weight: ${value.fontWeight}`);
          if (value.lineHeight) properties.push(`--${name}-line-height: ${value.lineHeight}`);
          if (value.letterSpacing)
            properties.push(`--${name}-letter-spacing: ${value.letterSpacing}`);

          // Also create a shorthand property
          const fontFamilyValue = Array.isArray(value.fontFamily)
            ? value.fontFamily.map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ')
            : value.fontFamily;

          // Quote font family if it contains spaces or special characters
          const quotedFontFamily =
            fontFamilyValue?.includes(' ') && !fontFamilyValue.startsWith('"')
              ? `"${fontFamilyValue}"`
              : fontFamilyValue || 'sans-serif';

          const shorthand = `${value.fontWeight || 400} ${value.fontSize || '16px'}/${value.lineHeight || 1.5} ${quotedFontFamily}`;
          properties.unshift(`--${name}: ${shorthand}`);

          return properties.join(';\n  ');
        }

        // Handle shadow tokens
        if (token.$type === 'shadow') {
          const tokenValue = token.$value || token.value;
          if (tokenValue === undefined) return null;

          const formatShadow = (shadow) => {
            return `${shadow.offsetX || '0px'} ${shadow.offsetY || '0px'} ${shadow.blur || '0px'} ${shadow.spread || '0px'} ${shadow.color || 'rgba(0,0,0,0.1)'}`;
          };

          let shadowValue;
          if (Array.isArray(tokenValue)) {
            shadowValue = tokenValue.map(formatShadow).join(', ');
          } else if (typeof tokenValue === 'object') {
            shadowValue = formatShadow(tokenValue);
          } else {
            shadowValue = tokenValue;
          }

          return `--${name}: ${shadowValue}`;
        }

        // Handle font family arrays
        if (token.$type === 'fontFamily' && Array.isArray(token.$value || token.value)) {
          const fontFamily = (token.$value || token.value)
            .map((f) => (f.includes(' ') ? `"${f}"` : f))
            .join(', ');
          return `--${name}: ${fontFamily}`;
        }

        // Handle other tokens normally
        let value = token.$value || token.value;

        // Skip tokens with undefined or null values (but not 0 or false)
        if (value === undefined || value === null) {
          return null;
        }

        // Handle references
        if (
          outputReferences &&
          token.original &&
          token.original.$value &&
          typeof token.original.$value === 'string' &&
          token.original.$value.startsWith('{')
        ) {
          value = `var(--${token.original.$value.slice(1, -1).replace(/\./g, '-').toLowerCase()})`;
        }

        return `--${name}: ${value}`;
      })
      .filter(Boolean);

    return `/**
 * Do not edit directly, this file was auto-generated.
 */

${selector} {
  ${tokens.join(';\n  ')};
}`;
  },
});
