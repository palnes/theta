# Testing Setup Guide

This guide explains the testing infrastructure used in the Theta design system monorepo.

## Overview

We use Vitest for testing across all packages, with browser-based testing for accurate component behavior verification.

## Prerequisites

### 1. Install Dependencies

```bash
yarn install
```

### 2. Install Playwright

Our tests run in real browsers using Playwright. If you're setting up a fresh environment:

```bash
# Install Playwright (already included in package.json)
yarn add -D playwright

# Install browser binaries (required on first setup)
npx playwright install chromium
```

> **Note**: The browser binaries are quite large (~130MB for Chromium). They're installed in your system cache, not in node_modules.

### 3. Verify Installation

```bash
# Run this from the web package directory
cd libs/web
yarn test --run
```

If you see "No test files found", Playwright is not properly installed.

## Test Architecture

### Web Package (`libs/web`)

Uses Vitest with browser mode for authentic testing:

- **Test Runner**: Vitest 3.x
- **Browser Provider**: Playwright
- **React Testing**: vitest-browser-react
- **Story Testing**: @storybook/addon-vitest

### Native Package (`libs/native`)

Uses Jest with React Native Testing Library:

- **Test Runner**: Jest 29.x with jest-expo preset
- **React Native Testing**: @testing-library/react-native
- **Story Testing**: @storybook/react with composeStories
- **Environment**: jsdom (for React Native web compatibility)

#### Web Configuration files:
- `vitest.config.ts` - Main config with projects
- `vitest.unit.config.ts` - Unit test configuration
- `vitest.storybook.config.ts` - Storybook test configuration

#### Native Configuration files:
- `jest.config.js` - Jest configuration with React Native presets
- `jest.setup.js` - Test setup with mocks for native modules

### Why Browser Mode?

Traditional Node-based testing with jsdom has limitations:
- Simulated DOM doesn't match real browsers
- CSS calculations are approximated
- Browser APIs are mocked
- Layout and visual testing isn't possible

Browser mode provides:
- Real browser rendering
- Accurate CSS and layout
- Native browser APIs
- Visual regression testing
- Better debugging with browser DevTools

## Running Tests

### Web Package
```bash
cd libs/web
yarn test              # Run all tests once
yarn test:watch        # Run tests in watch mode
yarn test:ui           # Open Vitest UI
```

### Native Package
```bash
cd libs/native
yarn test              # Run all tests once
yarn test:watch        # Run tests in watch mode
yarn test:coverage     # Run tests with coverage
```

### All Packages
```bash
# From root directory
yarn workspaces foreach -A run test
```

## Common Issues

### Web Testing Issues

#### "Missing @playwright/test dependency"
Install Playwright:
```bash
yarn add -D playwright
npx playwright install chromium
```

#### "Browser executable doesn't exist"
Install browser binaries:
```bash
npx playwright install chromium
```

#### Act warnings with React components
We use `vitest-browser-react` instead of `@testing-library/react` to prevent act warnings with React Aria Components. It's best to use vitest-browser-react for the web package.

#### Port conflicts
If you see "Port 63315 is in use", it means another test process is running. Either:
- Wait for the other process to finish
- Kill the process using the port
- The tests will automatically try another port

### Native Testing Issues

#### Module resolution errors
If you see "Cannot find module '@theta/tokens'", build the tokens package first:
```bash
yarn workspace @theta/tokens build
```

#### Transform errors with native modules
Add the module to `transformIgnorePatterns` in jest.config.js if it contains untransformed ES6 code.

#### Watchman warnings
Use `--no-watchman` flag or clear the watch:
```bash
yarn test --no-watchman
```

## Best Practices

### Web Testing
1. **Use browser mode for component testing** - More accurate than jsdom
2. **Write interaction tests in stories** - Use play functions for user flow testing
3. **Keep tests focused** - Test one behavior per test
4. **Use data-testid sparingly** - Prefer accessible queries (role, label, text)
5. **Test with real browser APIs** - Use actual browser functionality instead of mocking

### Native Testing
1. **Use portable stories** - Reuse Storybook stories in tests with composeStories
2. **Mock native modules properly** - See jest.setup.js for examples
3. **Test both iOS and Android behavior** - When platform-specific code exists
4. **Use testID for native** - More reliable than accessibility queries in React Native
5. **Keep mocks minimal** - Only mock what's necessary for tests to run

## CI Considerations

For CI environments:
- Playwright runs in headless mode by default
- Consider caching browser binaries
- May need to install system dependencies for browsers
- Use `playwright install-deps` for Linux CI environments