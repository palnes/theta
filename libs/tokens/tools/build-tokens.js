import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { build, parse } from '@terrazzo/parser';
import {
  DEFAULT_THEME,
  DIST_DIR,
  TEMP_DIR,
  createConfig,
  createPlugins,
} from './terrazzo-config.js';
import { processThemes } from './theme-processor.js';
import { TokenRegistry } from './token-registry.js';

/**
 * Parse base tokens from light theme (default)
 * @param {Object} themeTokens - Theme token objects keyed by theme name
 * @param {Object} config - Configuration object
 * @param {string} config.rootDir - Root directory path
 * @param {Object} config.parseConfig - Terrazzo parse configuration
 * @returns {Promise<{tokens: Object, sources: Array}>} Parsed token result
 */
async function parseBaseTokens(themeTokens, config) {
  const result = await parse(
    [
      {
        src: themeTokens[DEFAULT_THEME],
        filename: new URL(`file:///${config.rootDir}/${TEMP_DIR}/all-tokens.json`),
      },
    ],
    { config: config.parseConfig }
  );

  // Terrazzo validates token references during parsing

  console.log(`\n✓ Parsed ${Object.keys(result.tokens).length} base tokens`);
  return result;
}

/**
 * Write plugin-generated files to disk
 * @param {Array<{filename: string, contents: string}>} outputFiles - Files to write
 * @param {string} outDir - Output directory path
 * @returns {Promise<void>}
 */
async function writeOutputFiles(outputFiles, outDir) {
  console.log(`Main build output files: ${outputFiles.map((f) => f.filename).join(', ')}`);

  await Promise.all(
    outputFiles.map(async (file) => {
      const filePath = join(outDir, file.filename);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, file.contents);
    })
  );
}

/**
 * Build tokens with Terrazzo
 * @param {Object} themeTokens - Theme token objects keyed by theme name (e.g., { light: {...}, dark: {...} })
 * @param {string} rootDir - Root directory for the build
 * @returns {Promise<Object>} The parsed base tokens
 */
export async function buildTokens(themeTokens, rootDir) {
  const outDir = join(rootDir, DIST_DIR);

  // Step 1: Parse tokens from JSON to DTCG format
  const parseConfig = createConfig(rootDir, { parse: true });
  const baseResult = await parseBaseTokens(themeTokens, { rootDir, parseConfig });

  // Step 2: Parse and analyze theme variations (e.g., dark mode)
  const themeResults = await processThemes(themeTokens, baseResult.tokens, {
    rootDir,
    parseConfig,
  });

  // Step 3: Build registry to track token relationships and outputs
  const registry = new TokenRegistry();

  // Register base tokens
  for (const [id, token] of Object.entries(baseResult.tokens)) {
    registry.registerToken(id, token);
  }

  // Register theme variants
  for (const [themeName, themeResult] of Object.entries(themeResults)) {
    for (const [id, token] of Object.entries(themeResult.tokens)) {
      if (baseResult.tokens[id]) {
        registry.registerThemeVariant(id, themeName, token.$value);
      }
    }
  }

  // Step 4: Prepare data for plugins
  const themeTokensMap = Object.fromEntries(
    Object.entries(themeResults).map(([name, result]) => [name, result.tokens])
  );

  // Step 5: Create plugins that will generate output files
  // Plugins: CSS modules, TypeScript, JSON, docs
  const plugins = createPlugins(registry, themeTokensMap);
  const buildConfig = createConfig(rootDir, { plugins });

  // Step 6: Run Terrazzo build - executes all plugins
  const buildResult = await build(baseResult.tokens, {
    sources: baseResult.sources,
    config: buildConfig,
  });

  // Step 7: Write generated files to disk
  await writeOutputFiles(buildResult.outputFiles, outDir);

  return baseResult.tokens;
}
