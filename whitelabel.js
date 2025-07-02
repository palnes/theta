#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');
const { exec } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper to colorize output
const color = (text, colorCode) => `${colorCode}${text}${colors.reset}`;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Validate npm package name
function isValidPackageName(name) {
  const regex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  return regex.test(name);
}

// Get all files to process
function getAllFiles(dir, extensions = []) {
  const results = [];

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      // Skip node_modules, dist, build, and hidden directories
      if (stat.isDirectory()) {
        if (
          !file.startsWith('.') &&
          file !== 'node_modules' &&
          file !== 'dist' &&
          file !== 'build' &&
          file !== 'storybook-static'
        ) {
          walk(filePath);
        }
      } else {
        // Check if file has one of the target extensions
        if (extensions.length === 0 || extensions.some((ext) => file.endsWith(ext))) {
          results.push(filePath);
        }
      }
    }
  }

  walk(dir);
  return results;
}

// Create case-preserving replacements
function createCasePreservingReplacements(oldStr, newStr) {
  const replacements = [];

  // Original case
  replacements.push([oldStr, newStr]);

  // All lowercase
  replacements.push([oldStr.toLowerCase(), newStr.toLowerCase()]);

  // First letter capitalized
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  replacements.push([capitalize(oldStr), capitalize(newStr)]);

  // All uppercase
  replacements.push([oldStr.toUpperCase(), newStr.toUpperCase()]);

  // Remove duplicates
  const unique = [];
  const seen = new Set();
  for (const [search, replace] of replacements) {
    const key = `${search}::${replace}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push([search, replace]);
    }
  }

  return unique;
}

// Count occurrences in a file
function countOccurrences(content, searchStr) {
  const regex = new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

// Preview changes in a file
function previewFileChanges(filePath, replacements) {
  const content = fs.readFileSync(filePath, 'utf8');
  const changes = [];

  for (const [search, replace] of replacements) {
    const count = countOccurrences(content, search);
    if (count > 0) {
      changes.push({ search, replace, count });
    }
  }

  return changes;
}

// Apply replacements to a file
function applyReplacements(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [search, replace] of replacements) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(regex, replace);
    if (newContent !== content) {
      modified = true;
      content = newContent;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
}

// Discover packages in libs directory
function discoverPackages() {
  const packages = {};
  const libsDir = path.join(process.cwd(), 'libs');

  if (!fs.existsSync(libsDir)) {
    return packages;
  }

  const dirs = fs.readdirSync(libsDir).filter((file) => {
    const fullPath = path.join(libsDir, file);
    return (
      fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'package.json'))
    );
  });

  for (const dir of dirs) {
    const packageJsonPath = path.join(libsDir, dir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const packageName = packageJson.name;

    if (packageName && packageName.startsWith('@')) {
      const [, name] = packageName.split('/');
      packages[name] = name; // Default to keeping the same name
    }
  }

  return packages;
}

// Main function
async function main() {
  console.log(color('\n🎨 Project Whitelabel Tool\n', colors.bright));

  // Get current values from root package.json
  const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentProjectName = rootPackageJson.name || 'theta';

  // Discover packages
  const discoveredPackages = discoverPackages();
  const packageEntries = Object.entries(discoveredPackages);

  if (packageEntries.length === 0) {
    console.log(color('❌ No packages found in libs directory', colors.red));
    process.exit(1);
  }

  // Infer current scope from first package
  const firstPackagePath = path.join('libs', Object.keys(discoveredPackages)[0], 'package.json');
  const firstPackageJson = JSON.parse(fs.readFileSync(firstPackagePath, 'utf8'));
  const currentScope = firstPackageJson.name.split('/')[0];

  console.log(`Current project name: ${color(currentProjectName, colors.cyan)}`);
  console.log(`Current package scope: ${color(currentScope, colors.cyan)}`);
  console.log(
    `Found packages: ${color(packageEntries.map(([name]) => name).join(', '), colors.cyan)}\n`
  );

  // Ask for new values
  let newProjectName = await question('Enter new project name (lowercase, no spaces): ');
  newProjectName = newProjectName.trim().toLowerCase();

  if (!isValidPackageName(newProjectName)) {
    console.log(color('❌ Invalid project name. Must be lowercase with no spaces.', colors.red));
    process.exit(1);
  }

  let newScope = await question('Enter new package scope (e.g., @mycompany): ');
  newScope = newScope.trim();

  if (!newScope.startsWith('@')) {
    newScope = '@' + newScope;
  }

  if (!isValidPackageName(newScope + '/test')) {
    console.log(color('❌ Invalid package scope.', colors.red));
    process.exit(1);
  }

  // Ask if they want to rename individual packages
  const renamePackages = await question('\nRename individual packages? (y/n): ');

  let packageNames = { ...discoveredPackages };

  if (renamePackages.toLowerCase() === 'y') {
    console.log(
      color('\nEnter new names for packages (press Enter to keep current):', colors.cyan)
    );

    for (const [current, defaultName] of Object.entries(packageNames)) {
      const newName = await question(`  ${current} [${defaultName}]: `);
      if (newName.trim()) {
        if (!isValidPackageName(newName.trim())) {
          console.log(color(`❌ Invalid package name: ${newName}`, colors.red));
          process.exit(1);
        }
        packageNames[current] = newName.trim();
      }
    }
  }

  // Confirm changes
  console.log(color('\n📋 Summary of changes:', colors.bright));
  console.log(
    `  Project name: ${color(currentProjectName, colors.red)} → ${color(newProjectName, colors.green)}`
  );
  console.log(
    `  Package scope: ${color(currentScope, colors.red)} → ${color(newScope, colors.green)}`
  );
  console.log(`  Package names:`);
  for (const [oldName, newName] of Object.entries(packageNames)) {
    console.log(
      `    ${color(`${currentScope}/${oldName}`, colors.red)} → ${color(`${newScope}/${newName}`, colors.green)}`
    );
  }

  // Define replacements
  const replacements = [
    // Project name in root package.json (exact match)
    [`"name": "${currentProjectName}"`, `"name": "${newProjectName}"`],
  ];

  // Add case-preserving replacements for project names
  replacements.push(...createCasePreservingReplacements(currentProjectName, newProjectName));

  // If current project name was previously renamed (e.g., theta -> shbno), handle that too
  const possibleOldNames = ['theta', 'shbno'];
  for (const oldName of possibleOldNames) {
    if (oldName !== currentProjectName.toLowerCase()) {
      replacements.push(...createCasePreservingReplacements(oldName, newProjectName));
    }
  }

  // URL paths
  replacements.push([`/${currentProjectName}/`, `/${newProjectName}/`]);

  // Add package-specific replacements
  for (const [oldName, newName] of Object.entries(packageNames)) {
    if (oldName !== newName) {
      // Package name in package.json files
      replacements.push([
        `"name": "${currentScope}/${oldName}"`,
        `"name": "${newScope}/${newName}"`,
      ]);
      // Imports and dependencies
      replacements.push([`${currentScope}/${oldName}`, `${newScope}/${newName}`]);
      // Turbo.json references
      replacements.push([`"${currentScope}/${oldName}#`, `"${newScope}/${newName}#`]);
    } else {
      // Just update the scope
      replacements.push([
        `"name": "${currentScope}/${oldName}"`,
        `"name": "${newScope}/${oldName}"`,
      ]);
      replacements.push([`${currentScope}/${oldName}`, `${newScope}/${oldName}`]);
      replacements.push([`"${currentScope}/${oldName}#`, `"${newScope}/${oldName}#`]);
    }
  }

  // Preview mode
  const previewMode = await question('\nRun in preview mode first? (y/n): ');

  if (previewMode.toLowerCase() === 'y') {
    console.log(color('\n🔍 Preview Mode - Scanning files...', colors.yellow));

    const targetFiles = [
      ...getAllFiles('.', ['.json']),
      ...getAllFiles('libs', ['.ts', '.tsx', '.js', '.jsx', '.mdx']),
      ...getAllFiles('.', ['.md', '.mdx']),
    ];

    let totalChanges = 0;
    const fileChanges = [];

    for (const file of targetFiles) {
      const changes = previewFileChanges(file, replacements);
      if (changes.length > 0) {
        fileChanges.push({ file, changes });
        for (const change of changes) {
          totalChanges += change.count;
        }
      }
    }

    // Show preview
    console.log(
      color(`\nFound ${totalChanges} occurrences in ${fileChanges.length} files:`, colors.cyan)
    );

    for (const { file, changes } of fileChanges.slice(0, 10)) {
      console.log(`\n${color(file, colors.blue)}:`);
      for (const { search, replace, count } of changes) {
        console.log(
          `  ${color(search, colors.red)} → ${color(replace, colors.green)} (${count} times)`
        );
      }
    }

    if (fileChanges.length > 10) {
      console.log(color(`\n... and ${fileChanges.length - 10} more files`, colors.yellow));
    }
  }

  // Confirm execution
  const proceed = await question('\nProceed with renaming? (y/n): ');

  if (proceed.toLowerCase() !== 'y') {
    console.log(color('\n❌ Operation cancelled', colors.yellow));
    process.exit(0);
  }

  // Check git status first
  try {
    const { stdout } = await promisify(exec)('git status --porcelain');
    if (stdout.trim()) {
      console.log(color('\n⚠️  Warning: You have uncommitted changes', colors.yellow));
      console.log(
        color("It's recommended to commit or stash changes before proceeding.", colors.yellow)
      );

      const continueAnyway = await question('\nContinue anyway? (y/n): ');
      if (continueAnyway.toLowerCase() !== 'y') {
        console.log(color('\n❌ Operation cancelled', colors.yellow));
        process.exit(0);
      }
    }
  } catch (err) {
    console.log(color('\n⚠️  Warning: Not a git repository', colors.yellow));
  }

  // Apply changes
  console.log(color('\n✏️  Applying changes...', colors.cyan));

  const targetFiles = [
    ...getAllFiles('.', ['.json']),
    ...getAllFiles('libs', ['.ts', '.tsx', '.js', '.jsx', '.mdx']),
    ...getAllFiles('.', ['.md', '.mdx']),
  ];

  let modifiedCount = 0;

  for (const file of targetFiles) {
    if (applyReplacements(file, replacements)) {
      modifiedCount++;
      console.log(color(`  ✓ ${file}`, colors.green));
    }
  }

  console.log(color(`\n✅ Modified ${modifiedCount} files`, colors.green));

  // Post-update instructions
  console.log(color('\n📝 Next steps:', colors.bright));
  console.log('  1. Review changes: ' + color('git diff', colors.cyan));
  console.log('  2. Run: ' + color('yarn install', colors.cyan) + ' to update dependencies');
  console.log('  3. Run: ' + color('yarn clean', colors.cyan) + ' to clean build artifacts');
  console.log('  4. Run: ' + color('yarn build', colors.cyan) + ' to rebuild the project');
  console.log(
    '  5. Commit your changes: ' +
      color('git add -A && git commit -m "chore: rebrand to ' + newProjectName + '"', colors.cyan)
  );

  rl.close();
}

// Run the tool
main().catch((err) => {
  console.error(color(`\n❌ Error: ${err.message}`, colors.red));
  process.exit(1);
});
