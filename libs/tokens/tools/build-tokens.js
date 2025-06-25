import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { build, defineConfig, parse } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import cssModularPlugin from './plugins/css-modular.js';
import cssTypesPlugin from './plugins/css-types.js';
import cssPlugin from './plugins/css.js';
import docsPlugin from './plugins/docs.js';
import jsonPlugin from './plugins/json.js';
import typescriptNativePlugin from './plugins/typescript-native.js';
import typescriptPlugin from './plugins/typescript.js';

// Constants
const DIST_DIR = 'dist';
const TEMP_DIR = '.tmp';
const BASE_THEME = 'light';
const LOG_LEVEL = 'error';

/**
 * Build tokens with Terrazzo
 */
export async function buildTokens(themeTokens, rootDir) {
  const outDir = join(rootDir, DIST_DIR);

  // Define config for parsing
  const parseConfig = defineConfig(
    {
      tokens: `${TEMP_DIR}/all-tokens.json`,
      outDir: `./${DIST_DIR}`,
      plugins: [],
      lint: {
        build: { enabled: false },
        rules: {},
      },
      ignore: {
        tokens: [],
        deprecated: false,
      },
      logLevel: LOG_LEVEL, // Only show errors, not warnings
      noExit: true, // Don't exit on warnings
    },
    { cwd: new URL(`file:///${rootDir}/`) }
  );

  // Parse base theme tokens (light is our base)
  const parseResult = await parse(
    [
      {
        src: themeTokens[BASE_THEME],
        // Terrazzo requires filename to be a URL object, not a string
        filename: new URL(`file:///${rootDir}/${TEMP_DIR}/all-tokens.json`),
      },
    ],
    {
      config: parseConfig,
    }
  );

  // Validate token references
  const validateTokenReferences = (tokens, tokenSet = 'base') => {
    const errors = [];
    const tokenIds = new Set(Object.keys(tokens));

    for (const [id, token] of Object.entries(tokens)) {
      if (token.$value && typeof token.$value === 'string' && token.$value.startsWith('{')) {
        // This is a reference like {ref.color.blue.600}
        const refId = token.$value.slice(1, -1); // Remove { and }
        if (!tokenIds.has(refId)) {
          errors.push(`Token "${id}" references non-existent token "${refId}" in ${tokenSet}`);
        }
      }
    }

    return errors;
  };

  const baseErrors = validateTokenReferences(parseResult.tokens);
  if (baseErrors.length > 0) {
    console.error('❌ Token reference errors found:');
    baseErrors.forEach((error) => console.error(`   - ${error}`));
    process.exit(1);
  }

  console.log(`\n✓ Parsed ${Object.keys(parseResult.tokens).length} base tokens`);

  // Helper to count theme overrides
  const countThemeOverrides = (themeTokens, baseTokens) => {
    let overrideCount = 0;
    for (const [id, themeToken] of Object.entries(themeTokens)) {
      const baseToken = baseTokens[id];
      if (!baseToken || JSON.stringify(themeToken.$value) !== JSON.stringify(baseToken.$value)) {
        overrideCount++;
      }
    }
    return overrideCount;
  };

  // Parse light theme tokens for symmetry
  const LIGHT_THEME = 'light';
  const lightParseResult = await parse(
    [
      {
        src: themeTokens[LIGHT_THEME],
        filename: new URL(`file:///${rootDir}/${TEMP_DIR}/${LIGHT_THEME}-tokens.json`),
      },
    ],
    {
      config: parseConfig,
    }
  );
  const lightOverrides = countThemeOverrides(lightParseResult.tokens, parseResult.tokens);
  console.log(`✓ Light theme: ${lightOverrides} override tokens`);

  // Parse dark theme tokens separately to capture theme-specific overrides
  const DARK_THEME = 'dark';
  const darkParseResult = await parse(
    [
      {
        src: themeTokens[DARK_THEME],
        filename: new URL(`file:///${rootDir}/${TEMP_DIR}/${DARK_THEME}-tokens.json`),
      },
    ],
    {
      config: parseConfig,
    }
  );
  const darkOverrides = countThemeOverrides(darkParseResult.tokens, parseResult.tokens);
  console.log(`✓ Dark theme: ${darkOverrides} override tokens`);

  // Warn about tokens that exist in themes but not in base
  for (const [themeName, themeResult] of Object.entries({
    light: lightParseResult,
    dark: darkParseResult,
  })) {
    const themeOnlyTokens = [];
    for (const [id] of Object.entries(themeResult.tokens)) {
      if (!parseResult.tokens[id]) {
        themeOnlyTokens.push(id);
      }
    }
    if (themeOnlyTokens.length > 0) {
      console.log(
        `⚠️  Warning: ${themeOnlyTokens.length} tokens in ${themeName} theme don't exist in base:`
      );
      themeOnlyTokens.forEach((id) => console.log(`   - ${id}`));
    }
  }

  // Build main outputs
  const mainConfig = defineConfig(
    {
      tokens: `${TEMP_DIR}/all-tokens.json`,
      outDir: `./${DIST_DIR}`,
      plugins: [
        cssModularPlugin({
          themes: {
            [LIGHT_THEME]: lightParseResult.tokens,
            [DARK_THEME]: darkParseResult.tokens,
          },
        }),
        // NOTE: We generate tokens.ts since we only build React Native tokens now.
        // This means the React Native tokens get the clean "tokens.js" filename.
        // The native import path (@theta/tokens/native) still works via package.json exports.
        typescriptNativePlugin({
          filename: `../${TEMP_DIR}/tokens.ts`,
          themes: {
            [LIGHT_THEME]: lightParseResult.tokens,
            [DARK_THEME]: darkParseResult.tokens,
          },
        }),
        jsonPlugin({
          filename: 'tokens.json',
          themes: {
            [LIGHT_THEME]: lightParseResult.tokens,
            [DARK_THEME]: darkParseResult.tokens,
          },
        }),
        docsPlugin({
          filename: '../.storybook/generated/tokens-reference.json',
        }),
        cssTypesPlugin({
          filename: 'css.d.ts',
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

  return parseResult.tokens;
}
