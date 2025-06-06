import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import {
  logBrokenReferenceLevels,
  logVerbosityLevels,
  logWarningLevels,
} from 'style-dictionary/enums';

// Import all transformers and formatters
import './tools/transformers/index.js';
import './tools/formatters/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Register transform groups
StyleDictionary.registerTransformGroup({
  name: 'custom/css',
  transforms: [
    'attribute/cti',
    'dtcg/color',
    'dtcg/dimension',
    'dtcg/shadow/css',
    'dtcg/fontFamily/default',
    'dtcg/typography',
    'name/kebab',
  ],
});

StyleDictionary.registerTransformGroup({
  name: 'custom/js',
  transforms: [
    'attribute/cti',
    'dtcg/color',
    'dtcg/dimension/unitless',
    'dtcg/shadow/rn',
    'dtcg/fontFamily/default',
    'dtcg/typography',
    'name/flat',
  ],
});

const config = {
  log: {
    warnings: logWarningLevels.warn, // 'warn' | 'error' | 'disabled'
    verbosity: logVerbosityLevels.verbose, // 'default' | 'silent' | 'verbose'
    errors: {
      brokenReferences: logBrokenReferenceLevels.throw, // 'throw' | 'console'
    },
  },
  parsers: [],
  source: [
    join(__dirname, 'src/tokens/primitives/**/*.json'),
    join(__dirname, 'src/tokens/semantic/**/*.json'),
    join(__dirname, 'src/tokens/component/**/*.json'),
  ],
  hooks: {
    formats: {
      // Hook that runs before any format
      async 'format:start'({ destination }) {
        console.log(`  → ${destination}`);
      },
    },
  },
  platforms: {
    css: {
      transformGroup: 'custom/css',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/expanded',
          filter: (token) => {
            // Include semantic and component tokens only
            return token.path[0] === 'sys' || token.path[0] === 'cmp';
          },
          options: {
            outputReferences: false,
            selector: ':root',
          },
        },
        {
          destination: 'internal-all-tokens.css',
          format: 'css/expanded',
          options: {
            outputReferences: false,
            selector: ':root',
          },
        },
      ],
    },
    js: {
      transformGroup: 'custom/js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/module-flat',
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/module-declarations',
          options: {
            outputStringLiterals: true,
          },
        },
      ],
    },
    json: {
      transformGroup: 'custom/js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/nested-rn',
        },
      ],
    },
    documentation: {
      transformGroup: 'custom/js',
      buildPath: 'dist/docs/',
      files: [
        {
          destination: 'tokens-reference.json',
          format: 'documentation/json',
        },
      ],
    },
  },
};

export default config;
