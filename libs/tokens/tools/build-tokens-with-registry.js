#!/usr/bin/env node

/**
 * Example of building tokens with the new registry system
 */

import registryDocsPlugin from './plugins/registry-docs.js';
import { withRegistry } from './registry-adapter.js';
import { TokenRegistry } from './token-registry.js';

// Import existing plugins
import cssModularPlugin from './plugins/css-modular.js';
import docsPlugin from './plugins/docs.js';
import jsonPlugin from './plugins/json.js';
import typescriptNativePlugin from './plugins/typescript-native.js';

// Import the original build function
import { buildTokens as originalBuildTokens } from './build-tokens.js';

/**
 * Build tokens with registry tracking
 */
export async function buildTokensWithRegistry(themeTokens, rootDir) {
  // We need to duplicate some of the build logic to inject our registry
  const { mkdir, readFile, writeFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const { defineConfig, parse, build } = await import('@terrazzo/parser');

  // Create a new registry
  const registry = new TokenRegistry();

  // Constants from original build
  const DIST_DIR = 'dist';
  const TEMP_DIR = '.tmp';
  const BASE_THEME = 'light';

  // Create temp directory
  await mkdir(join(rootDir, TEMP_DIR), { recursive: true });

  // Save merged base tokens to a temp file
  await writeFile(
    join(rootDir, TEMP_DIR, 'all-tokens.json'),
    JSON.stringify(themeTokens[BASE_THEME], null, 2)
  );

  // Parse base tokens
  const parseConfig = defineConfig(
    {
      tokens: `${TEMP_DIR}/all-tokens.json`,
      outDir: `./${DIST_DIR}`,
      plugins: [],
      lint: {
        build: { enabled: false },
        rules: {},
      },
    },
    { cwd: new URL(`file:///${rootDir}/`) }
  );

  const parseResult = await parse(
    [
      {
        src: themeTokens[BASE_THEME],
        filename: new URL(`file:///${rootDir}/${TEMP_DIR}/all-tokens.json`),
      },
    ],
    {
      config: parseConfig,
    }
  );

  // Parse theme variants
  const darkParseResult = await parse(
    [
      {
        src: themeTokens.dark,
        filename: new URL(`file:///${rootDir}/${TEMP_DIR}/dark-tokens.json`),
      },
    ],
    {
      config: parseConfig,
    }
  );

  // Register all base tokens
  Object.entries(parseResult.tokens).forEach(([id, token]) => {
    registry.registerToken(id, token);
  });

  // Register theme variants
  Object.entries(darkParseResult.tokens).forEach(([id, token]) => {
    const baseToken = parseResult.tokens[id];
    if (baseToken && JSON.stringify(token.$value) !== JSON.stringify(baseToken.$value)) {
      registry.registerThemeVariant(id, 'dark', token.$value);
    }
  });

  // Create registry-aware plugins
  const plugins = [
    // Wrap existing plugins
    withRegistry(cssModularPlugin({ themes: themeTokens, registry }), registry),
    withRegistry(typescriptNativePlugin({ themes: themeTokens }), registry),
    withRegistry(jsonPlugin({ themes: themeTokens }), registry),

    // Add registry documentation plugin (runs last)
    registryDocsPlugin({
      registry,
      filename: 'docs/tokens-registry.json',
      includeStats: true,
      format: 'nested',
    }),
  ];

  // Build with registry-aware plugins
  const buildConfig = defineConfig(
    {
      tokens: `${TEMP_DIR}/all-tokens.json`,
      outDir: `./${DIST_DIR}`,
      plugins,
    },
    { cwd: new URL(`file:///${rootDir}/`) }
  );

  const buildResult = await build(parseResult.tokens, {
    sources: parseResult.sources,
    config: buildConfig,
  });

  // Write output files
  const outDir = join(rootDir, DIST_DIR);
  for (const file of buildResult.outputFiles) {
    const filePath = join(outDir, file.filename);
    await mkdir(join(outDir, ...file.filename.split('/').slice(0, -1)), { recursive: true });
    await writeFile(filePath, file.contents);
  }

  console.log('✓ Build complete with registry tracking');

  // Return the registry for further use
  return registry;
}

/**
 * Example usage and queries
 */
export function demonstrateRegistryQueries(registry) {
  console.log('\n📊 Registry Query Examples:\n');

  // Get all color tokens
  const colorTokens = registry.getTokensByType('color');
  console.log(`Color tokens: ${colorTokens.length}`);

  // Get impact analysis for a base color
  const impactedTokens = registry.getImpactAnalysis('ref.color.blue.500');
  console.log(`\nTokens affected by ref.color.blue.500: ${impactedTokens.length}`);
  impactedTokens.slice(0, 5).forEach((id) => console.log(`  - ${id}`));

  // Get a specific token with all its outputs
  const token = registry.getToken('sys.color.action.primary.default');
  if (token) {
    console.log('\nToken details:');
    console.log(`  ID: ${token.id}`);
    console.log(`  Value: ${token.value}`);
    console.log('  Outputs:');
    Object.entries(token.outputs).forEach(([format, output]) => {
      console.log(`    ${format}: ${output.name} = ${output.value}`);
    });
  }

  // Get all tokens for a component
  const buttonTokens = registry.getTokensByComponent('button');
  console.log(`\nButton component tokens: ${buttonTokens.length}`);

  // Get coverage statistics
  const allTokens = registry.getAllTokens();
  const tokensWithCss = registry.getTokensByFormat('css');
  const tokensWithJs = registry.getTokensByFormat('js');

  console.log('\nCoverage:');
  console.log(`  Total tokens: ${allTokens.length}`);
  console.log(
    `  With CSS output: ${tokensWithCss.length} (${Math.round((tokensWithCss.length / allTokens.length) * 100)}%)`
  );
  console.log(
    `  With JS output: ${tokensWithJs.length} (${Math.round((tokensWithJs.length / allTokens.length) * 100)}%)`
  );
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const { mergeTokenFiles } = await import('./merge-tokens.js');

  async function main() {
    console.log('🚀 Building tokens with registry...\n');

    const rootDir = process.cwd();

    // Merge tokens for themes
    const themeTokens = {};
    for (const theme of ['light', 'dark']) {
      themeTokens[theme] = await mergeTokenFiles(rootDir, theme);
      console.log(`✓ Merged tokens for '${theme}' theme`);
    }

    // Build with registry
    const registry = await buildTokensWithRegistry(themeTokens, rootDir);

    // Demonstrate queries
    demonstrateRegistryQueries(registry);
  }

  main().catch(console.error);
}
