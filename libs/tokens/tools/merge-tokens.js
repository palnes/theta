import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'glob';

// Constants
const DEFAULT_THEME = 'light';
const TOKEN_PATHS = {
  reference: 'src/tokens/reference/**/*.json',
  semanticBase: 'src/tokens/semantic/base/**/*.json',
  component: 'src/tokens/component/**/*.json',
  themeOverride: (theme) => `src/tokens/semantic/${theme}/**/*.json`,
};
const THEMES_FILE = '**/$themes.json';

/**
 * Deep merge function for token objects
 * Recursively merges source into target, overwriting primitives and arrays
 */
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * Merge all token files into a single object
 */
export async function mergeTokenFiles(rootDir, theme = DEFAULT_THEME) {
  // Always load reference and base semantic tokens
  const basePattern = [TOKEN_PATHS.reference, TOKEN_PATHS.semanticBase, TOKEN_PATHS.component];

  // Add theme-specific overrides if not light theme
  const patterns =
    theme === DEFAULT_THEME ? basePattern : [...basePattern, TOKEN_PATHS.themeOverride(theme)];

  const allTokens = {};

  for (const pattern of patterns) {
    const tokenFiles = await glob(pattern, {
      cwd: rootDir,
      ignore: [THEMES_FILE],
    });

    for (const file of tokenFiles) {
      const content = await readFile(join(rootDir, file), 'utf-8');
      const data = JSON.parse(content);
      deepMerge(allTokens, data);
    }
  }

  console.log(`Merged tokens for '${theme}' theme`);
  return allTokens;
}
