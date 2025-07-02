# Whitelabel Tool

This tool helps you rebrand the project with your own project name and package scope.

## Usage

Run the interactive CLI tool:

```bash
node whitelabel.js
```

Or if you've made it executable:

```bash
./whitelabel.js
```

## What it does

The tool will:

1. **Automatically discover all packages** in the `libs` directory

2. **Ask for your new project details:**
   - New project name (e.g., `mydesignsystem`)
   - New package scope (e.g., `@mycompany`)
   - Option to rename each discovered package individually

3. **Replace throughout the codebase:**
   - Package names: `@currentscope/*` → `@yourscope/*`
   - Project name: `currentproject` → `yourproject`
   - Individual package names if changed (e.g., `@currentscope/web` → `@acme/ui-components`)
   - Imports in TypeScript/JavaScript files
   - Dependencies in package.json files
   - References in documentation
   - Turbo.json pipeline references

4. **Safety features:**
   - Preview mode to see changes before applying
   - Checks git status and warns about uncommitted changes
   - Validates package names for npm compatibility
   - Preserves text capitalization (e.g., `current`/`Current`/`CURRENT` → `new`/`New`/`NEW`)

## Example

```
🎨 Project Whitelabel Tool

Current project name: <current>
Current package scope: @<current>
Found packages: native, tokens, web

Enter new project name (lowercase, no spaces): aurora
Enter new package scope (e.g., @mycompany): @acme

Rename individual packages? (y/n): y

Enter new names for packages (press Enter to keep current):
  native [native]: mobile
  tokens [tokens]: design-tokens
  web [web]: ui-components

📋 Summary of changes:
  Project name: <current> → aurora
  Package scope: @<current> → @acme
  Package names:
    @<current>/native → @acme/mobile
    @<current>/tokens → @acme/design-tokens
    @<current>/web → @acme/ui-components

Run in preview mode first? (y/n): y

🔍 Preview Mode - Scanning files...
Found 127 occurrences in 23 files...

Proceed with renaming? (y/n): y
```

## After running

After the tool completes:

1. Review the changes with `git diff`
2. Run `yarn install` to update dependencies
3. Run `yarn clean` to remove old build artifacts  
4. Run `yarn build` to rebuild with new names
5. Commit your changes with `git add -A && git commit -m "chore: rebrand to <projectname>"`

## Git Integration

The tool checks for uncommitted changes before running and warns you if any are found. It's recommended to have a clean git status before whitelabeling.

## What gets updated

- All `package.json` files
- TypeScript/JavaScript imports (`.ts`, `.tsx`, `.js`, `.jsx`)
- Markdown documentation (`.md`, `.mdx`)
- Configuration files (turbo.json, etc.)

## What doesn't get updated

- Git history
- Published npm packages
- External references or links
- Binary files or images