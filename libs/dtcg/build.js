import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import js from '@terrazzo/plugin-js';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Deep merge function
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

console.log('\n🎨 Building Design Tokens with Terrazzo...\n');

// First merge all tokens into a single file
const tokenFiles = await glob('src/tokens/**/*.json', { cwd: __dirname });
console.log(`Found ${tokenFiles.length} token files`);

const allTokens = {};
for (const file of tokenFiles) {
  const content = await readFile(join(__dirname, file), 'utf-8');
  const data = JSON.parse(content);
  deepMerge(allTokens, data);
}

// Define config
const config = defineConfig(
  {
    tokens: './temp/all-tokens.json',
    outDir: './dist',
    plugins: [],
    lint: {
      build: { enabled: false },
      rules: {},
    },
    ignore: {
      tokens: [],
      deprecated: false,
    },
  },
  { cwd: new URL(`file:///${__dirname}/`) }
);

// Parse tokens with proper format
const parseResult = await parse(
  [
    {
      src: allTokens,
      filename: new URL(`file:///${__dirname}/temp/all-tokens.json`),
    },
  ],
  {
    config,
  }
);

console.log(`\n✓ Parsed ${Object.keys(parseResult.tokens).length} tokens`);

// Build main outputs with updated plugins
const mainConfig = defineConfig(
  {
    tokens: './temp/all-tokens.json',
    outDir: './dist',
    plugins: [
      css({
        filename: 'tokens.css',
        // Mode selectors for theme support
        modeSelectors: [
          { mode: 'light', selectors: ['.theme-light', '[data-theme="light"]'] },
          { mode: 'dark', selectors: ['.theme-dark', '[data-theme="dark"]'] },
        ],
      }),
      js({
        js: 'tokens.js',
        // Optionally also generate JSON
        // json: 'tokens.json',
      }),
    ],
  },
  { cwd: new URL(`file:///${__dirname}/`) }
);

const buildResult = await build(parseResult.tokens, {
  sources: parseResult.sources,
  config: mainConfig,
});

// Write main output files
console.log(`Main build output files: ${buildResult.outputFiles.map(f => f.filename).join(', ')}`);
for (const file of buildResult.outputFiles) {
  const filePath = join(__dirname, 'dist', file.filename);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, file.contents);
}

// Generate internal-all-tokens.css (all tokens without mode selectors)
const internalConfig = defineConfig(
  {
    tokens: './temp/all-tokens.json',
    outDir: './dist/css',
    plugins: [
      css({
        filename: 'internal-all-tokens.css',
      }),
    ],
  },
  { cwd: new URL(`file:///${__dirname}/`) }
);

const internalBuildResult = await build(parseResult.tokens, {
  sources: parseResult.sources,
  config: internalConfig,
});

// Write internal output files
for (const file of internalBuildResult.outputFiles) {
  const filePath = join(__dirname, 'dist/css', file.filename);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, file.contents);
}

// Generate themes.css
const themesContent = `/* Theme CSS classes */
.theme-light,
[data-theme="light"] {
  color-scheme: light;
}

.theme-dark,
[data-theme="dark"] {
  color-scheme: dark;
}

/* Ensure proper inheritance */
.theme-light *,
[data-theme="light"] * {
  color-scheme: light;
}

.theme-dark *,
[data-theme="dark"] * {
  color-scheme: dark;
}
`;

await mkdir(join(__dirname, 'dist/css'), { recursive: true });
await writeFile(join(__dirname, 'dist/css/themes.css'), themesContent);

console.log('\n✅ Build completed successfully!');
console.log('  → dist/tokens.css');
console.log('  → dist/tokens.js');
console.log('  → dist/css/internal-all-tokens.css');
console.log('  → dist/css/themes.css\n');

// Generate documentation
console.log('Generating documentation...');
const documentation = {
  ref: {},
  sys: {},
  cmp: {},
  metadata: {
    generatedAt: new Date().toISOString(),
    totalTokens: Object.keys(parseResult.tokens).length
  }
};

// Process tokens to create documentation structure
const tokenArray = Object.entries(parseResult.tokens);
tokenArray.forEach(([path, token]) => {
  const parts = path.split('.');
  const tier = parts[0];
  const category = parts[1];
  
  if (!['ref', 'sys', 'cmp'].includes(tier)) return;
  
  if (!documentation[tier]) documentation[tier] = {};
  if (!documentation[tier][category]) {
    documentation[tier][category] = [];
  }
  
  // Format value based on type for documentation
  let formattedValue = token.$value;
  if (token.$type === 'color' && typeof token.$value === 'object' && 'colorSpace' in token.$value) {
    const { components, alpha = 1 } = token.$value;
    const [r, g, b] = components;
    formattedValue = alpha === 1 
      ? `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
      : `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
  }
  
  documentation[tier][category].push({
    name: parts[parts.length - 1],
    path: path,
    type: token.$type || 'unknown',
    description: token.$description || '',
    originalValue: token.$value,
    value: formattedValue,
    cssVariable: `--${path.replace(/\./g, '-').toLowerCase()}`,
    jsPath: `tokens.${path}`,
    jsFlat: path.replace(/\./g, '_').toUpperCase(),
    hasReferences: false,
    references: []
  });
});

// Write documentation file
const docsDir = join(__dirname, 'dist/docs');
await mkdir(docsDir, { recursive: true });
await writeFile(
  join(docsDir, 'tokens-reference.json'),
  JSON.stringify(documentation, null, 2)
);

console.log('✓ Documentation generated at dist/docs/tokens-reference.json');
