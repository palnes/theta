import { readFileSync } from 'node:fs';
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

// Load theme configuration
const themesConfig = JSON.parse(readFileSync(join(__dirname, 'src/tokens/$themes.json'), 'utf8'));

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

// Create configurations for themes based on $themes.json
const createThemeConfig = (themeConfig) => {
  const includes = [];
  const sources = [];

  // Add token sets based on configuration
  Object.entries(themeConfig.selectedTokenSets).forEach(([tokenSet, status]) => {
    if (status === 'enabled') {
      // Don't include $themes.json itself
      if (!tokenSet.includes('$')) {
        const path = join(__dirname, `src/tokens/${tokenSet}.json`);

        // Separate theme files from base tokens
        if (tokenSet.startsWith('themes/')) {
          sources.push(path);
        } else {
          includes.push(path);
        }
      }
    }
  });

  return {
    log: {
      warnings: logWarningLevels.warn, // 'warn' | 'error' | 'disabled'
      verbosity: logVerbosityLevels.verbose, // 'default' | 'silent' | 'verbose'
      errors: {
        brokenReferences: logBrokenReferenceLevels.throw, // 'throw' | 'console'
      },
    },
    parsers: [],
    include: includes,
    source: sources,
    hooks: {
      formats: {
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
            destination: `theme-${themeConfig.id}.css`,
            format: 'css/themed',
            filter: (token) => {
              // Only include color tokens that are different from base
              return token.path[0] === 'sys' && token.path[1] === 'color';
            },
            options: {
              outputReferences: false,
              themeName: themeConfig.id === 'light' ? null : themeConfig.id,
            },
          },
        ],
      },
    },
  };
};

// Export function to build all themes
export const buildThemes = async () => {
  // Build individual theme files based on configuration
  for (const themeConfig of themesConfig.$themes) {
    // Skip building separate file for light theme as it's the base
    if (themeConfig.id !== 'light') {
      console.log(`  Building ${themeConfig.name}...`);
      const config = createThemeConfig(themeConfig);
      const sd = new StyleDictionary(config);
      await sd.buildAllPlatforms();
    }
  }

  // Generate combined themes.css by reading the individual theme files
  const { readFileSync, mkdirSync, writeFileSync } = await import('node:fs');
  let combinedCss = '/**\n * Theme overrides for Theta Design System\n */\n\n';

  // Read each theme CSS file and combine
  for (const themeConfig of themesConfig.$themes) {
    if (themeConfig.id !== 'light') {
      try {
        const themeCss = readFileSync(
          join(__dirname, `dist/css/theme-${themeConfig.id}.css`),
          'utf8'
        );

        // Extract the content between the brackets
        const match = themeCss.match(/\{([^}]+)\}/);
        if (match) {
          const variables = match[1].trim();

          combinedCss += `[data-theme="${themeConfig.id}"] {\n  ${variables}\n}\n\n`;

          // Add prefers-color-scheme for dark theme
          if (themeConfig.id === 'dark') {
            combinedCss += '@media (prefers-color-scheme: dark) {\n';
            combinedCss += `  :root:not([data-theme="light"]) {\n`;
            combinedCss += `    ${variables}\n`;
            combinedCss += '  }\n';
            combinedCss += '}\n';
          }
        }
      } catch (error) {
        console.warn(`Could not read theme file for ${themeConfig.id}:`, error.message);
      }
    }
  }

  // Write combined themes file
  const outputPath = join(__dirname, 'dist/css');
  mkdirSync(outputPath, { recursive: true });
  writeFileSync(join(outputPath, 'themes.css'), combinedCss);
  console.log('  → themes.css (combined)');
};

export default { buildThemes };
