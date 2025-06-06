import StyleDictionary from 'style-dictionary';

// Custom name transform to convert to kebab case
StyleDictionary.registerTransform({
  name: 'name/kebab',
  type: 'name',
  transform: (token) => {
    return token.path.join('-').toLowerCase();
  },
});

// Custom name transform for JS to create flat names
StyleDictionary.registerTransform({
  name: 'name/flat',
  type: 'name',
  transform: (token) => {
    // Convert path to camelCase
    return token.path
      .map((part, index) => {
        if (index === 0) return part;
        // Handle numeric parts
        if (/^\d/.test(part)) return part;
        // Capitalize first letter
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  },
});
