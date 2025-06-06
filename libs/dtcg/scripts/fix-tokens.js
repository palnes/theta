import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fix the manrope font family format
const typographyPath = join(__dirname, '../src/tokens/primitives/typography.json');
const typography = JSON.parse(await readFile(typographyPath, 'utf-8'));

// Convert manrope to array format
typography.ref.fontFamily.manrope.$value = ['Manrope', 'sans-serif'];

// Fix font weights to use semantic names
const weightMap = {
  400: 'regular',
  500: 'medium',
  600: 'semi-bold',
  700: 'bold',
};

for (const [numeric, semantic] of Object.entries(weightMap)) {
  if (typography.ref.fontWeight[numeric]) {
    typography.ref.fontWeight[semantic] = typography.ref.fontWeight[numeric];
    typography.ref.fontWeight[semantic].$value = semantic;
    delete typography.ref.fontWeight[numeric];
  }
}

await writeFile(typographyPath, JSON.stringify(typography, null, 2));

console.log('✓ Fixed font family and weight formats');
