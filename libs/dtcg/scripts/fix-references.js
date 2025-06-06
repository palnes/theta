import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Map old references to new ones
const referenceMap = {
  '{ref.fontWeight.400}': '{ref.fontWeight.regular}',
  '{ref.fontWeight.500}': '{ref.fontWeight.medium}',
  '{ref.fontWeight.600}': '{ref.fontWeight.semi-bold}',
  '{ref.fontWeight.700}': '{ref.fontWeight.bold}',
};

// Find all token files
const tokenFiles = await glob('src/tokens/**/*.json', { cwd: rootDir });

for (const file of tokenFiles) {
  const filePath = join(rootDir, file);
  let content = await readFile(filePath, 'utf-8');
  let modified = false;

  // Replace all references
  for (const [oldRef, newRef] of Object.entries(referenceMap)) {
    if (content.includes(oldRef)) {
      content = content.replace(
        new RegExp(oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        newRef
      );
      modified = true;
    }
  }

  if (modified) {
    await writeFile(filePath, content);
    console.log(`✓ Updated references in ${file}`);
  }
}

console.log('✓ Fixed all font weight references');
