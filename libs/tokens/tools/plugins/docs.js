/**
 * Terrazzo plugin that generates documentation from token registry
 */
export default function docsPlugin(options = {}) {
  const { filename = '../.storybook/generated/tokens-generic.json', registry } = options;

  return {
    name: 'docs',
    enforce: 'post',
    async build({ outputFile }) {
      if (!registry) {
        throw new Error('Registry is required for docs plugin.');
      }

      const documentation = registry.exportForDocumentation({
        includeStats: true,
        format: 'nested',
      });

      // Remove source mapping from tokens
      const removeSource = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(removeSource);

        return Object.entries(obj).reduce((cleaned, [key, value]) => {
          if (key !== 'source') {
            cleaned[key] = removeSource(value);
          }
          return cleaned;
        }, {});
      };

      // Adapt to match the expected format
      const tokenValues = Object.values(documentation.tokens).flat();
      const adapted = {
        tokens: removeSource(documentation.tokens),
        metadata: {
          ...documentation.metadata,
          stats: {
            total: documentation.metadata.stats.total,
            byType: documentation.metadata.stats.byType,
            byCategory: documentation.metadata.stats.byComponent,
            withOutputs: tokenValues.filter((t) => t?.outputs && Object.keys(t.outputs).length > 0)
              .length,
          },
        },
      };

      await outputFile(filename, JSON.stringify(adapted, null, 2));
    },
  };
}
