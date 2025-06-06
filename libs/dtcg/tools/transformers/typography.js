import StyleDictionary from 'style-dictionary';

// Register custom transform for typography tokens
StyleDictionary.registerTransform({
  name: 'dtcg/typography',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'typography',
  transform: (token) => {
    const value = token.$value || token.value;

    // Handle null/undefined values
    if (value == null) return token.value;

    // For typography objects, ensure proper structure
    if (typeof value === 'object' && value !== null) {
      return value;
    }

    // For string values (shouldn't happen with DTCG but handle gracefully)
    return value;
  },
});
