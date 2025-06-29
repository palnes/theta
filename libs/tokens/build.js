import { exec } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { buildTokens } from './tools/build-tokens.js';
import { removeFilesWithPattern } from './tools/file-utils.js';
import { mergeTokenFiles } from './tools/merge-tokens.js';

const execAsync = promisify(exec);

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('\n🎨 Building Design Tokens...\n');

// 1. Build both themes in parallel
const themes = ['light', 'dark'];
console.log('📦 Processing themes...');
const themeResults = await Promise.all(
  themes.map(async (theme) => {
    const tokens = await mergeTokenFiles(__dirname, theme);
    return { theme, tokens };
  })
);

const themeTokens = Object.fromEntries(themeResults.map(({ theme, tokens }) => [theme, tokens]));

// 2. Build tokens with all themes
await buildTokens(themeTokens, __dirname);

// 3. Compile TypeScript to JavaScript
console.log('\n📝 Compiling TypeScript tokens...');
try {
  // Compile tokens
  await execAsync(
    'npx tsc .tmp/tokens.ts --declaration --outDir dist --target es2022 --module esnext --moduleResolution node --skipLibCheck',
    {
      cwd: __dirname,
    }
  );

  console.log('✓ TypeScript compilation complete');

  // Remove TypeScript source files from dist (keep only .js and .d.ts)
  console.log('🧹 Removing TypeScript source files...');
  await removeFilesWithPattern(join(__dirname, 'dist'), /(?<!\.d)\.ts$/);
  console.log('✓ TypeScript source files removed');
} catch (error) {
  console.error('TypeScript compilation failed:', error);
  process.exit(1);
}

console.log('\n✅ Build completed successfully!');
console.log('  → dist/tokens.js');
console.log('  → dist/tokens.d.ts');
console.log('  → dist/tokens.json');
console.log('  → dist/css.d.ts');
console.log('  → dist/css/* (modular CSS)');
console.log('  → .storybook/generated/tokens-generic.json');
console.log('\n🎉 All build artifacts generated successfully!\n');
