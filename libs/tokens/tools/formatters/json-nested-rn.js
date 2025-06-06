import StyleDictionary from 'style-dictionary';

// Custom JSON formatter that handles React Native shadows
StyleDictionary.registerFormat({
  name: 'json/nested-rn',
  format: ({ dictionary }) => {
    const buildNestedObject = (tokens) => {
      const result = {};

      tokens.forEach((token) => {
        let current = result;
        const path = [...token.path];
        const lastKey = path.pop();

        // Build nested structure
        path.forEach((key) => {
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        });

        // Get the value - shadows are already transformed by dtcg/shadow/rn transform
        const value = token.$value !== undefined ? token.$value : token.value;
        current[lastKey] = value;
      });

      return result;
    };

    const nested = buildNestedObject(dictionary.allTokens);
    return JSON.stringify(nested, null, 2);
  },
});
