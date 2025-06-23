import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { build, defineConfig, parse } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import cssTypesPlugin from './plugins/css-types.js';
import docsPlugin from './plugins/docs.js';
import flatJsPlugin from './plugins/flat-js.js';
import nestedJsonPlugin from './plugins/nested-json.js';
import themeCssPlugin from './plugins/theme-css.js';
import typescriptDefinitionsPlugin from './plugins/typescript-definitions.js';

/**
 * Build tokens with Terrazzo
 */
export async function buildTokens(allTokens, rootDir) {
  const outDir = join(rootDir, 'dist');

  // Define config for parsing
  const parseConfig = defineConfig(
    {
      tokens: './temp/all-tokens.json',
      outDir: './dist',
      plugins: [],
      lint: {
        build: { enabled: false },
        rules: {},
      },
      ignore: {
        tokens: [],
        deprecated: false,
      },
      logLevel: 'error', // Only show errors, not warnings
      noExit: true, // Don't exit on warnings
    },
    { cwd: new URL(`file:///${rootDir}/`) }
  );

  // Parse tokens
  const parseResult = await parse(
    [
      {
        src: allTokens,
        filename: new URL(`file:///${rootDir}/temp/all-tokens.json`),
      },
    ],
    {
      config: parseConfig,
    }
  );

  console.log(`\n✓ Parsed ${Object.keys(parseResult.tokens).length} tokens`);

  // Build main outputs
  const mainConfig = defineConfig(
    {
      tokens: './temp/all-tokens.json',
      outDir: './dist',
      plugins: [
        css({
          filename: 'tokens.css',
          modeSelectors: [
            { mode: 'light', selectors: ['.theme-light', '[data-theme="light"]'] },
            { mode: 'dark', selectors: ['.theme-dark', '[data-theme="dark"]'] },
          ],
        }),
        flatJsPlugin({
          filename: 'tokens.js',
        }),
        nestedJsonPlugin({
          filename: 'tokens.json',
        }),
        typescriptDefinitionsPlugin({
          filename: 'tokens.d.ts',
        }),
        docsPlugin({
          filename: 'docs/tokens-reference.json',
        }),
        cssTypesPlugin({
          filename: 'css.d.ts',
        }),
        themeCssPlugin({
          filename: 'css/themes.css',
        }),
      ],
    },
    { cwd: new URL(`file:///${rootDir}/`) }
  );

  const buildResult = await build(parseResult.tokens, {
    sources: parseResult.sources,
    config: mainConfig,
  });

  // Write main output files
  console.log(
    `Main build output files: ${buildResult.outputFiles.map((f) => f.filename).join(', ')}`
  );
  for (const file of buildResult.outputFiles) {
    const filePath = join(outDir, file.filename);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, file.contents);
  }

  // Generate internal CSS (all tokens without mode selectors)
  const internalConfig = defineConfig(
    {
      tokens: './temp/all-tokens.json',
      outDir: './dist/css',
      plugins: [
        css({
          filename: 'internal-all-tokens.css',
        }),
      ],
    },
    { cwd: new URL(`file:///${rootDir}/`) }
  );

  const internalBuildResult = await build(parseResult.tokens, {
    sources: parseResult.sources,
    config: internalConfig,
  });

  // Write internal output files
  for (const file of internalBuildResult.outputFiles) {
    const filePath = join(outDir, 'css', file.filename);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, file.contents);
  }

  return parseResult.tokens;
}
