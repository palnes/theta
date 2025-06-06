import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('Merging token files...');

// Find all token files
const tokenFiles = await glob('src/tokens/**/*.json', { cwd: rootDir });
console.log(`Found ${tokenFiles.length} token files`);

// Read and merge all tokens
const allTokens = {};
for (const file of tokenFiles) {
  const content = await readFile(join(rootDir, file), 'utf-8');
  const data = JSON.parse(content);
  Object.assign(allTokens, data);
}

// Write merged tokens
await mkdir(join(rootDir, 'temp'), { recursive: true });
await writeFile(join(rootDir, 'temp/all-tokens.json'), JSON.stringify(allTokens, null, 2));

console.log('✓ Merged tokens written to temp/all-tokens.json');
