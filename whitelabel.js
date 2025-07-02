#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { promisify } = require('node:util');
const { exec } = require('node:child_process');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};
const color = (text, colorCode) => `${colorCode}${text}${colors.reset}`;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));
const execAsync = promisify(exec);

// Validate npm package name
const isValidPackageName = (name) =>
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name);

// Get all files recursively
const getAllFiles = (dir, extensions = []) => {
  const results = [];
  const excludeDirs = ['.', 'node_modules', 'dist', 'build', 'storybook-static'];

  const walk = (currentDir) => {
    for (const file of fs.readdirSync(currentDir)) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !excludeDirs.some((ex) => file.startsWith(ex))) {
        walk(filePath);
      } else if (!extensions.length || extensions.some((ext) => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  };

  walk(dir);
  return results;
};

// Create case variants
const caseVariants = (oldStr, newStr) => {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return [
    ...new Set([
      `${oldStr}|${newStr}`,
      `${oldStr.toLowerCase()}|${newStr.toLowerCase()}`,
      `${capitalize(oldStr)}|${capitalize(newStr)}`,
      `${oldStr.toUpperCase()}|${newStr.toUpperCase()}`,
    ]),
  ].map((v) => v.split('|'));
};

// Process a single file
const processFile = (file, replacements, preview = false) => {
  let content = fs.readFileSync(file, 'utf8');
  const fileChanges = [];
  let totalCount = 0;

  for (const [search, replace] of replacements) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const count = (content.match(regex) || []).length;

    if (count > 0) {
      fileChanges.push({ search, replace, count });
      totalCount += count;
      if (!preview) content = content.replace(regex, replace);
    }
  }

  if (!preview && fileChanges.length > 0) {
    fs.writeFileSync(file, content);
  }

  return { fileChanges, totalCount };
};

// Process all files
const processFiles = (files, replacements, preview = false) => {
  const changes = {};
  let totalCount = 0;

  for (const file of files) {
    const { fileChanges, totalCount: fileCount } = processFile(file, replacements, preview);
    if (fileChanges.length > 0) {
      changes[file] = fileChanges;
      totalCount += fileCount;
    }
  }

  return { changes, totalCount, fileCount: Object.keys(changes).length };
};

// Discover packages
const discoverPackages = () => {
  const packages = {};
  const libsDir = path.join(process.cwd(), 'libs');

  if (!fs.existsSync(libsDir)) return packages;

  for (const dir of fs.readdirSync(libsDir)) {
    const packageJsonPath = path.join(libsDir, dir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (name?.startsWith('@')) packages[name.split('/')[1]] = name.split('/')[1];
    }
  }

  return packages;
};

// Show preview of changes
const showPreview = (changes, totalCount, fileCount) => {
  console.log(color(`\nFound ${totalCount} changes in ${fileCount} files:`, colors.cyan));

  const entries = Object.entries(changes);
  const previewCount = Math.min(entries.length, 10);

  for (let i = 0; i < previewCount; i++) {
    const [file, fileChanges] = entries[i];
    console.log(`\n${color(file, colors.blue)}:`);
    for (const { search, replace, count } of fileChanges) {
      console.log(`  ${color(search, colors.red)} → ${color(replace, colors.green)} (${count}x)`);
    }
  }

  if (entries.length > 10) {
    console.log(color(`\n... and ${fileCount - 10} more files`, colors.yellow));
  }
};

// Get user input for new values
const getNewValues = async () => {
  const newProjectName = (await question('New project name (lowercase): ')).trim().toLowerCase();
  if (!isValidPackageName(newProjectName)) {
    console.log(color('❌ Invalid project name', colors.red));
    process.exit(1);
  }

  let newScope = (await question('New package scope (e.g., @mycompany): ')).trim();
  if (!newScope.startsWith('@')) newScope = `@${newScope}`;
  if (!isValidPackageName(`${newScope}/test`)) {
    console.log(color('❌ Invalid package scope', colors.red));
    process.exit(1);
  }

  return { newProjectName, newScope };
};

// Get new package names if user wants to rename
const getNewPackageNames = async (packages, packageKeys) => {
  const packageNames = { ...packages };
  if ((await question('\nRename packages? (y/n): ')).toLowerCase() === 'y') {
    console.log(color('\nNew names (Enter to keep):', colors.cyan));

    for (const current of packageKeys) {
      const newName = (await question(`  ${current}: `)).trim();
      if (newName) {
        if (!isValidPackageName(newName)) {
          console.log(color('❌ Invalid package name', colors.red));
          process.exit(1);
        }
        packageNames[current] = newName;
      }
    }
  }
  return packageNames;
};

// Build all replacements
const buildReplacements = (currentProjectName, newProjectName, currentScope, newScope, packageNames) => {
  const replacements = [
    [`"name": "${currentProjectName}"`, `"name": "${newProjectName}"`],
    ...caseVariants(currentProjectName, newProjectName),
    [`/${currentProjectName}/`, `/${newProjectName}/`],
  ];

  for (const [oldName, newName] of Object.entries(packageNames)) {
    replacements.push(
      [`"name": "${currentScope}/${oldName}"`, `"name": "${newScope}/${newName}"`],
      [`${currentScope}/${oldName}`, `${newScope}/${newName}`],
      [`"${currentScope}/${oldName}#`, `"${newScope}/${newName}#`]
    );
  }

  return replacements;
};

// Check git status
const checkGitStatus = async () => {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    if (stdout.trim()) {
      console.log(color('\n⚠️  Uncommitted changes detected', colors.yellow));
      if ((await question('Continue anyway? (y/n): ')).toLowerCase() !== 'y') {
        console.log(color('\n❌ Cancelled', colors.yellow));
        process.exit(0);
      }
    }
  } catch {
    console.log(color('\n⚠️  Not a git repository', colors.yellow));
  }
};

// Main
async function main() {
  console.log(color('\n🎨 Project Whitelabel Tool\n', colors.bright));

  // Get current values
  const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentProjectName = rootPackageJson.name || 'theta';
  const packages = discoverPackages();
  const packageKeys = Object.keys(packages);

  if (!packageKeys.length) {
    console.log(color('❌ No packages found', colors.red));
    process.exit(1);
  }

  // Infer current scope
  const firstPackage = JSON.parse(
    fs.readFileSync(path.join('libs', packageKeys[0], 'package.json'), 'utf8')
  );
  const currentScope = firstPackage.name.split('/')[0];

  console.log(
    `Current: ${color(currentProjectName, colors.cyan)} / ${color(currentScope, colors.cyan)}`
  );
  console.log(`Packages: ${color(packageKeys.join(', '), colors.cyan)}\n`);

  // Get new values
  const { newProjectName, newScope } = await getNewValues();

  // Get package names
  const packageNames = await getNewPackageNames(packages, packageKeys);

  // Show summary
  console.log(color('\n📋 Summary:', colors.bright));
  console.log(`  ${currentProjectName} → ${newProjectName}`);
  console.log(`  ${currentScope} → ${newScope}`);
  for (const [oldName, newName] of Object.entries(packageNames)) {
    console.log(`  ${currentScope}/${oldName} → ${newScope}/${newName}`);
  }

  // Build replacements
  const replacements = buildReplacements(currentProjectName, newProjectName, currentScope, newScope, packageNames);

  // Get target files
  const targetFiles = [
    ...getAllFiles('.', ['.json']),
    ...getAllFiles('libs', ['.ts', '.tsx', '.js', '.jsx', '.mdx']),
    ...getAllFiles('.', ['.md', '.mdx']),
  ];

  // Preview
  if ((await question('\nPreview changes? (y/n): ')).toLowerCase() === 'y') {
    const { changes, totalCount, fileCount } = processFiles(targetFiles, replacements, true);
    showPreview(changes, totalCount, fileCount);
  }

  // Check git status
  await checkGitStatus();

  // Apply changes
  if ((await question('\nProceed with renaming? (y/n): ')).toLowerCase() !== 'y') {
    console.log(color('\n❌ Cancelled', colors.yellow));
    process.exit(0);
  }

  console.log(color('\n✏️  Applying changes...', colors.cyan));
  const { fileCount } = processFiles(targetFiles, replacements);
  console.log(color(`\n✅ Modified ${fileCount} files`, colors.green));

  // Next steps
  console.log(color('\n📝 Next steps:', colors.bright));
  const steps = [
    'git diff',
    'yarn install',
    'yarn clean && yarn build',
    `git add -A && git commit -m "chore: rebrand to ${newProjectName}"`,
  ];
  for (let i = 0; i < steps.length; i++) {
    console.log(`  ${i + 1}. ${color(steps[i], colors.cyan)}`);
  }

  rl.close();
}

main().catch((err) => {
  console.error(color(`\n❌ Error: ${err.message}`, colors.red));
  process.exit(1);
});