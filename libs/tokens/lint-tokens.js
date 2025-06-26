#!/usr/bin/env node

/**
 * Standalone token linting
 */

import { defineConfig, parse } from '@terrazzo/parser';
import thetaLintPlugin from './tools/lint-rules.js';
import { mergeTokenFiles } from './tools/merge-tokens.js';

async function lintTokens() {
  console.log('🔍 Linting Design Tokens...\n');

  const rootDir = process.cwd();

  // Merge tokens
  const tokens = await mergeTokenFiles(rootDir, 'light');

  // Create config with aggressive linting
  const config = defineConfig(
    {
      tokens: 'tokens.json',
      plugins: [thetaLintPlugin()],
      lint: {
        build: { enabled: true },
        rules: {
          'theta/no-hardcoded-colors': 'warn',
          'theta/component-naming': 'warn',
          'theta/required-states': 'warn',
          'theta/no-circular-references': 'error',
          'theta/require-token-types': 'warn',
        },
      },
    },
    { cwd: new URL(`file:///${rootDir}/`) }
  );

  // Parse and lint
  try {
    await parse(
      [
        {
          src: tokens,
          filename: new URL(`file:///${rootDir}/tokens.json`),
        },
      ],
      { config }
    );

    console.log('\n✅ No lint errors found!');
  } catch (error) {
    console.error('\n❌ Lint errors found');
    process.exit(1);
  }
}

lintTokens().catch(console.error);
