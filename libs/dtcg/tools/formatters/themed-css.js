import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
  name: 'css/themed',
  format: ({ dictionary, file, options }) => {
    const themeName = options.themeName;
    const themeSelector = themeName ? `[data-theme="${themeName}"]` : ':root';
    const mediaQuery = options.mediaQuery;

    // Filter to only include sys tokens (no component tokens in theme overrides)
    const tokens = dictionary.allTokens.filter(
      (token) => token.path[0] === 'sys' && token.path[1] === 'color'
    );

    if (tokens.length === 0) {
      return '';
    }

    const variables = tokens
      .map((token) => {
        const cssVarName = `--${token.name}`;
        const value =
          token.$value || token.value || token.original?.$value || token.original?.value;
        return `  ${cssVarName}: ${value};`;
      })
      .join('\n');

    let css = `${themeSelector} {\n${variables}\n}`;

    // Add media query wrapper if specified
    if (mediaQuery) {
      css = `@media ${mediaQuery} {\n  ${css}\n}`;
    }

    return css;
  },
});
