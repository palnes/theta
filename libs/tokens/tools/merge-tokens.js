import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'glob';

/**
 * Deep merge function for token objects
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
export async function mergeTokenFiles(rootDir) {
  const tokenFiles = await glob('src/tokens/**/*.json', { cwd: rootDir });
  console.log(`Found ${tokenFiles.length} token files`);

  const allTokens = {};
  for (const file of tokenFiles) {
    const content = await readFile(join(rootDir, file), 'utf-8');
    const data = JSON.parse(content);
    deepMerge(allTokens, data);
  }

  return allTokens;
}
