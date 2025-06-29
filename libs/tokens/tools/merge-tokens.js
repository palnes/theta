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
 * @param {Object} target - Target object to merge into
 * @param {Object} source - Source object to merge from
 * @returns {Object} The merged target object
 * @example
 * deepMerge({a: {b: 1}}, {a: {c: 2}}) // {a: {b: 1, c: 2}}
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
 * @param {string} rootDir - Root directory containing token files
 * @param {string} [theme='light'] - Theme name to merge
 * @returns {Promise<Object>} Merged token object
 * @throws {Error} If no token files are found or file reading fails
 */
export async function mergeTokenFiles(rootDir, theme = DEFAULT_THEME) {
  try {
    // Always load reference and base semantic tokens
    const basePattern = [TOKEN_PATHS.reference, TOKEN_PATHS.semanticBase, TOKEN_PATHS.component];

    // Always check for theme-specific overrides (even if empty)
    const patterns = [...basePattern, TOKEN_PATHS.themeOverride(theme)];

    const allTokens = {};
    let fileCount = 0;

    for (const pattern of patterns) {
      const tokenFiles = await glob(pattern, {
        cwd: rootDir,
        ignore: [THEMES_FILE],
      });

      for (const file of tokenFiles) {
        try {
          const content = await readFile(join(rootDir, file), 'utf-8');
          const data = JSON.parse(content);
          deepMerge(allTokens, data);
          fileCount++;
        } catch (error) {
          console.error(`Error processing token file ${file}:`, error.message);
          throw new Error(`Failed to process token file: ${file}`);
        }
      }
    }

    console.log(`Merged ${fileCount} token files for '${theme}' theme`);
    return allTokens;
  } catch (error) {
    console.error('Error merging token files:', error);
    throw error;
  }
}
