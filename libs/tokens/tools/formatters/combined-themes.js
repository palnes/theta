import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
  name: 'css/combined-themes',
  format: ({ dictionary, file, options }) => {
    let css = '/**\n * Theme overrides for Theta Design System\n */\n\n';

    // Filter to only include sys color tokens
    const tokens = dictionary.allTokens.filter(
      (token) => token.path[0] === 'sys' && token.path[1] === 'color'
    );

    if (tokens.length === 0) {
      return css;
    }

    const variables = tokens
      .map((token) => {
        const cssVarName = `--${token.name}`;
        const value =
          token.$value || token.value || token.original?.$value || token.original?.value;
        return `  ${cssVarName}: ${value};`;
      })
      .join('\n');

    // Dark theme with data-theme selector
    css += `[data-theme="dark"] {\n${variables}\n}\n\n`;

    // Dark theme with prefers-color-scheme
    css += '@media (prefers-color-scheme: dark) {\n';
    css += `  :root:not([data-theme="light"]) {\n`;
    css += `${variables
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}\n`;
    css += '  }\n';
    css += '}\n';

    return css;
  },
});
