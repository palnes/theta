// Constants
const DEFAULT_FILENAME = 'css.d.ts';
const MODULE_NAME = '@theta/tokens/css';

/**
 * Terrazzo plugin that generates TypeScript definitions for CSS imports
 */
export default function cssTypesPlugin(options = {}) {
  const { filename = DEFAULT_FILENAME } = options;

  return {
    name: 'css-types',
    async build({ outputFile }) {
      const cssTypes = `declare module '${MODULE_NAME}' {
  const content: string;
  export default content;
}
`;

      await outputFile(filename, cssTypes);
      console.log('✓ Generated CSS TypeScript definitions');
    },
  };
}
