import { exec } from 'node:child_process';
import { watch } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

const TOKEN_DIRS = [
  join(__dirname, 'src/tokens/reference'),
  join(__dirname, 'src/tokens/semantic'),
  join(__dirname, 'src/tokens/component'),
];

let buildInProgress = false;
let pendingBuild = false;

/**
 * Run the build process
 */
async function runBuild() {
  if (buildInProgress) {
    pendingBuild = true;
    return;
  }

  buildInProgress = true;
  console.log('\n🔨 Building tokens...');

  try {
    const startTime = Date.now();
    await execAsync('node build.js', { cwd: __dirname });
    const elapsed = Date.now() - startTime;
    console.log(`✅ Build completed in ${elapsed}ms`);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
  } finally {
    buildInProgress = false;

    if (pendingBuild) {
      pendingBuild = false;
      runBuild();
    }
  }
}

/**
 * Watch token directories for changes
 */
function watchTokens() {
  console.log('👀 Watching for token changes...\n');

  const watchers = TOKEN_DIRS.map((dir) => {
    console.log(`  📁 Watching: ${dir.replace(__dirname, '.')}`);

    return watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename?.endsWith('.json')) {
        console.log(`\n📝 ${eventType}: ${filename}`);
        runBuild();
      }
    });
  });

  // Also watch the $themes.json file
  const themesFile = join(__dirname, 'src/tokens/$themes.json');
  const themeWatcher = watch(themesFile, (eventType) => {
    console.log(`\n📝 ${eventType}: $themes.json`);
    runBuild();
  });

  // Initial build
  runBuild();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping watch mode...');
    watchers.forEach((watcher) => watcher.close());
    themeWatcher.close();
    process.exit(0);
  });
}

// Start watching
watchTokens();
