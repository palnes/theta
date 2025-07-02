/**
 * Theme processing utilities
 */

import { parse } from '@terrazzo/parser';
import { areTokenValuesEqual } from './token-helpers.js';

/**
 * Parse theme tokens and return results
 * @param {string} themeName - Name of the theme
 * @param {Object} themeTokens - Theme token data
 * @param {Object} config - Configuration
 * @param {string} config.rootDir - Root directory
 * @param {Object} config.parseConfig - Terrazzo parse config
 * @returns {Promise<Object>} Parse result
 */
export async function parseTheme(themeName, themeTokens, config) {
  const result = await parse(
    [
      {
        src: themeTokens,
        filename:
          config.filename || new URL(`file:///${config.rootDir}/.tmp/${themeName}-tokens.json`),
      },
    ],
    { config: config.parseConfig }
  );

  return result;
}

/**
 * Find tokens that differ between theme and base
 * @param {Object} themeTokens - Theme tokens object
 * @param {Object} baseTokens - Base tokens object
 * @returns {Array<{id: string, token: Object, isNew: boolean}>} Override information
 */
export function findThemeOverrides(themeTokens, baseTokens) {
  const overrides = [];

  for (const [id, themeToken] of Object.entries(themeTokens)) {
    const baseToken = baseTokens[id];
    if (!baseToken || !areTokenValuesEqual(themeToken.$value, baseToken.$value)) {
      overrides.push({ id, token: themeToken, isNew: !baseToken });
    }
  }

  return overrides;
}

/**
 * Process all themes and return results
 * @param {Object} themes - Object of theme names to theme tokens
 * @param {Object} baseTokens - Base tokens object
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Object of theme names to theme results
 */
export async function processThemes(themes, baseTokens, config) {
  const results = {};

  for (const [themeName, themeTokens] of Object.entries(themes)) {
    const parseResult = await parseTheme(themeName, themeTokens, config);
    const overrides = findThemeOverrides(parseResult.tokens, baseTokens);
    const themeOnly = Object.keys(parseResult.tokens).filter((id) => !baseTokens[id]);

    results[themeName] = {
      tokens: parseResult.tokens,
      overrides,
      themeOnly,
      sources: parseResult.sources,
    };

    // Log results
    console.log(
      `✓ ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme: ${overrides.length} override tokens`
    );

    if (themeOnly.length > 0) {
      console.log(
        `⚠️  Warning: ${themeOnly.length} tokens in ${themeName} theme don't exist in base:`
      );
      for (const id of themeOnly) {
        console.log(`   - ${id}`);
      }
    }
  }

  return results;
}
