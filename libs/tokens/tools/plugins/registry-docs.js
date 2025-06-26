/**
 * Registry-based documentation plugin
 *
 * This plugin leverages the TokenRegistry to generate comprehensive documentation
 * that includes all token outputs across all formats.
 */

export default function registryDocsPlugin(options = {}) {
  const {
    registry,
    filename = 'docs/tokens-registry.json',
    includeStats = true,
    includeTransformations = false,
    format = 'nested',
  } = options;

  if (!registry) {
    throw new Error('Registry is required for registry-docs plugin');
  }

  return {
    name: 'registry-docs',

    // Run this plugin last to ensure all outputs are registered
    enforce: 'post',

    async build({ outputFile }) {
      console.log('✓ Registry Docs: Generating comprehensive documentation...');

      // Export registry data
      const documentation = registry.exportForDocumentation({
        includeStats,
        includeTransformations,
        format,
      });

      // Add additional metadata
      documentation.metadata = {
        ...documentation.metadata,
        generator: 'registry-docs-plugin',
        version: '1.0.0',
      };

      // Generate summary statistics
      if (includeStats) {
        const stats = documentation.metadata.stats;

        // Calculate coverage (tokens with at least one output)
        const tokensWithOutputs = new Set();
        registry.tokens.forEach((token, id) => {
          if (token.outputs.size > 0) {
            tokensWithOutputs.add(id);
          }
        });

        stats.coverage = {
          total: registry.tokens.size,
          withOutputs: tokensWithOutputs.size,
          percentage: Math.round((tokensWithOutputs.size / registry.tokens.size) * 100),
        };

        // Calculate reference statistics
        stats.references = {
          tokensWithReferences: registry.indexes.references.size,
          tokensReferenced: registry.indexes.referencedBy.size,
          totalReferences: Array.from(registry.indexes.references.values()).reduce(
            (sum, refs) => sum + refs.size,
            0
          ),
        };
      }

      // Write the documentation file
      const content = JSON.stringify(documentation, null, 2);
      await outputFile(filename, content);

      console.log(`✓ Registry Docs: Generated ${filename}`);
      console.log(`  Total tokens: ${registry.tokens.size}`);
      console.log(`  Formats: ${documentation.formats.join(', ')}`);

      if (includeStats) {
        const coverage = documentation.metadata.stats.coverage;
        console.log(
          `  Coverage: ${coverage.withOutputs}/${coverage.total} (${coverage.percentage}%)`
        );
      }
    },
  };
}

/**
 * Create a plugin that provides direct registry access
 * This allows plugins to register outputs explicitly
 */
export function createRegistryPlugin(registry) {
  return {
    name: 'registry-provider',

    // Run first to make registry available to other plugins
    enforce: 'pre',

    async transform({ tokens, setTransform }) {
      // Register all tokens with the registry
      Object.entries(tokens).forEach(([id, token]) => {
        registry.registerToken(id, token);
      });

      // Make registry available via transform API (hacky but works)
      setTransform('__registry__', {
        format: 'internal',
        value: registry,
      });
    },
  };
}
