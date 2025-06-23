/**
 * Terrazzo plugin that generates TypeScript definitions for CSS imports
 */
export default function cssTypesPlugin(options = {}) {
  const { filename = 'css.d.ts' } = options;

  return {
    name: 'css-types',
    async build({ outputFile }) {
      const cssTypes = `declare module '@theta/tokens/css' {
  const content: string;
  export default content;
}
`;

      await outputFile(filename, cssTypes);
      console.log('✓ Generated CSS TypeScript definitions');
    },
  };
}
