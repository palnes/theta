import StyleDictionary from 'style-dictionary';

// Transform font family objects to use the default weight
StyleDictionary.registerTransform({
  name: 'dtcg/fontFamily/default',
  type: 'value',
  transitive: true,
  filter: (token) => {
    return (
      token.$type === 'fontFamily' &&
      typeof token.$value === 'object' &&
      !Array.isArray(token.$value)
    );
  },
  transform: (token) => {
    const value = token.$value || token.value;

    // If it's an object with weight keys, return the 400 weight or first available
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Try common default weights
      const defaultWeight = value['400'] || value.normal || value.regular;
      if (defaultWeight) {
        return defaultWeight;
      }

      // Otherwise return the first value
      const weights = Object.keys(value).filter((key) => !key.startsWith('$'));
      if (weights.length > 0) {
        return value[weights[0]];
      }
    }

    return value;
  },
});
