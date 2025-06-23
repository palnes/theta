import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokens } from './tools/build-tokens.js';
import { mergeTokenFiles } from './tools/merge-tokens.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('\n🎨 Building Design Tokens with Terrazzo...\n');

// 1. Merge all tokens
const allTokens = await mergeTokenFiles(__dirname);

// 2. Build tokens with Terrazzo (includes all plugins)
await buildTokens(allTokens, __dirname);

console.log('\n✅ Build completed successfully!');
console.log('  → dist/tokens.css');
console.log('  → dist/tokens.js');
console.log('  → dist/tokens.json');
console.log('  → dist/tokens.d.ts');
console.log('  → dist/css/internal-all-tokens.css');
console.log('  → dist/css/themes.css');
console.log('  → dist/docs/tokens-reference.json');
console.log('  → dist/css.d.ts');
console.log('\n🎉 All build artifacts generated successfully!\n');
