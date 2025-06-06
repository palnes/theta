import StyleDictionary from 'style-dictionary';
import config from './config.js';
import { buildThemes } from './theme-config.js';

console.log('\n🎨 Building Design Tokens...\n');

// Build main tokens
console.log('📦 Building base tokens:');
const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();

// Build themes
console.log('\n🎨 Building theme overrides:');
await buildThemes();

console.log('\n✅ Build completed successfully!\n');
