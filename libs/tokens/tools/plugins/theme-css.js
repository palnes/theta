/**
 * Terrazzo plugin that generates theme CSS classes
 */
export default function themeCssPlugin(options = {}) {
  const { filename = 'css/themes.css' } = options;

  return {
    name: 'theme-css',
    async build({ outputFile }) {
      const themesContent = `/* Theme CSS classes */
.theme-light,
[data-theme="light"] {
  color-scheme: light;
}

.theme-dark,
[data-theme="dark"] {
  color-scheme: dark;
}

/* Ensure proper inheritance */
.theme-light *,
[data-theme="light"] * {
  color-scheme: light;
}

.theme-dark *,
[data-theme="dark"] * {
  color-scheme: dark;
}
`;

      await outputFile(filename, themesContent);
      console.log('✓ Generated theme CSS');
    },
  };
}
