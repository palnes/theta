/**
 * Enhanced token merging with source tracking
 *
 * This version tracks where each token comes from during the merge process
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'glob';

/**
 * Merge token files with source tracking
 */
export async function mergeTokenFilesWithTracking(rootDir, theme = 'light', registry = null) {
  const tokenPaths = {
    reference: 'src/tokens/reference/**/*.json',
    semanticBase: 'src/tokens/semantic/base/**/*.json',
    component: 'src/tokens/component/**/*.json',
    semanticTheme: theme !== 'light' ? `src/tokens/semantic/${theme}/**/*.json` : null,
  };

  const mergedTokens = {};
  const sourceTracking = new Map(); // tokenId -> sources[]

  // Helper to get relative path for cleaner source tracking
  const getRelativePath = (fullPath) => {
    return fullPath.replace(`${rootDir}/`, '');
  };

  // Process each layer in order
  for (const [layer, pattern] of Object.entries(tokenPaths)) {
    if (!pattern) continue; // Skip null patterns (like semanticTheme for light theme)

    const files = await glob(pattern, {
      cwd: rootDir,
      ignore: ['**/$themes.json'],
    });

    for (const file of files) {
      const filePath = join(rootDir, file);

      try {
        const content = await readFile(filePath, 'utf-8');
        const tokens = JSON.parse(content);

        // Extract category from filename (e.g., 'color.json' -> 'color')
        const category = file.split('/').pop().replace('.json', '');

        // Merge tokens with tracking
        await mergeTokensRecursive(
          tokens,
          mergedTokens,
          sourceTracking,
          {
            file: getRelativePath(filePath),
            layer,
            theme: layer === 'semanticTheme' ? theme : 'default',
            category,
            priority: getLayerPriority(layer),
          },
          registry
        );
      } catch (error) {
        console.warn(`Warning: Could not read ${file}:`, error.message);
      }
    }
  }

  // If registry provided, finalize all tokens
  if (registry) {
    for (const tokenId of sourceTracking.keys()) {
      registry.mergeAndRegister(tokenId);
    }
  }

  return { tokens: mergedTokens, sources: sourceTracking };
}

/**
 * Recursively merge tokens with source tracking
 */
async function mergeTokensRecursive(
  source,
  target,
  sourceTracking,
  sourceInfo,
  registry,
  path = ''
) {
  for (const [key, value] of Object.entries(source)) {
    const currentPath = path ? `${path}.${key}` : key;

    // Check if this is a token (has $value) or a group
    if (value && typeof value === 'object' && '$value' in value) {
      // This is a token
      target[key] = value;

      // Track the source
      if (!sourceTracking.has(currentPath)) {
        sourceTracking.set(currentPath, []);
      }

      const source = {
        ...sourceInfo,
        path: currentPath,
        value: value.$value,
        type: value.$type,
        originalDefinition: value,
      };

      sourceTracking.get(currentPath).push(source);

      // Register with registry if provided
      if (registry) {
        registry.registerTokenSource(currentPath, value, sourceInfo);
      }
    } else if (value && typeof value === 'object') {
      // This is a group, recurse
      if (!target[key]) {
        target[key] = {};
      }

      await mergeTokensRecursive(
        value,
        target[key],
        sourceTracking,
        sourceInfo,
        registry,
        currentPath
      );
    } else {
      // Direct value assignment (shouldn't happen in DTCG format)
      target[key] = value;
    }
  }
}

/**
 * Get priority for merge ordering
 */
function getLayerPriority(layer) {
  const priorities = {
    reference: 100,
    semanticBase: 200,
    component: 300,
    semanticTheme: 400,
  };
  return priorities[layer] || 0;
}

/**
 * Analyze merge results
 */
export function analyzeMergeResults(sourceTracking) {
  const analysis = {
    totalTokens: sourceTracking.size,
    singleSource: 0,
    multipleSources: 0,
    conflicts: [],
    byLayer: {},
    byFile: {},
  };

  sourceTracking.forEach((sources, tokenId) => {
    if (sources.length === 1) {
      analysis.singleSource++;
    } else {
      analysis.multipleSources++;

      // Check for value conflicts
      const uniqueValues = new Set(sources.map((s) => JSON.stringify(s.value)));
      if (uniqueValues.size > 1) {
        analysis.conflicts.push({
          tokenId,
          sources: sources.map((s) => ({
            file: s.file,
            layer: s.layer,
            value: s.value,
          })),
        });
      }
    }

    // Count by layer
    sources.forEach((source) => {
      if (!analysis.byLayer[source.layer]) {
        analysis.byLayer[source.layer] = 0;
      }
      analysis.byLayer[source.layer]++;

      // Count by file
      if (!analysis.byFile[source.file]) {
        analysis.byFile[source.file] = 0;
      }
      analysis.byFile[source.file]++;
    });
  });

  return analysis;
}

/**
 * Get the winning source for a token (what actually gets used)
 */
export function getWinningSource(sources) {
  // Sort by priority (highest wins)
  const sorted = [...sources].sort((a, b) => b.priority - a.priority);
  return sorted[0];
}

/**
 * Example usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  async function demo() {
    const rootDir = process.cwd();
    const theme = process.argv[2] || 'light';
    const { tokens, sources } = await mergeTokenFilesWithTracking(rootDir, theme);

    console.log('📊 Merge Analysis:');
    const analysis = analyzeMergeResults(sources);

    console.log(`\nTotal tokens: ${analysis.totalTokens}`);
    console.log(`Single source: ${analysis.singleSource}`);
    console.log(`Multiple sources: ${analysis.multipleSources}`);
    console.log(`Conflicts: ${analysis.conflicts.length}`);

    console.log('\nTokens by layer:');
    Object.entries(analysis.byLayer).forEach(([layer, count]) => {
      console.log(`  ${layer}: ${count}`);
    });

    if (analysis.conflicts.length > 0) {
      console.log('\nFirst 5 conflicts:');
      analysis.conflicts.slice(0, 5).forEach((conflict) => {
        console.log(`\n  ${conflict.tokenId}:`);
        conflict.sources.forEach((source) => {
          console.log(`    ${source.layer}/${source.file}: ${JSON.stringify(source.value)}`);
        });
      });
    }

    // Example: trace a specific token
    const exampleToken = 'ref.color.blue.500';
    if (sources.has(exampleToken)) {
      console.log(`\n\nTracing ${exampleToken}:`);
      sources.get(exampleToken).forEach((source) => {
        console.log(`  ${source.layer} (${source.file}): ${JSON.stringify(source.value)}`);
      });
      console.log(`  Winner: ${getWinningSource(sources.get(exampleToken)).file}`);
    }
  }

  demo().catch(console.error);
}
