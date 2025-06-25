# @theta/tokens

Design tokens for the Theta design system, following the Design Token Community Group (DTCG) specification.

## Overview

This package contains all design tokens for the Theta design system and generates platform-specific outputs for web and native applications. The tokens follow a three-tier architecture:

- **Reference** (`ref.*`) - Raw values like colors, dimensions, and typography
- **Semantic** (`sys.*`) - Context-aware tokens that reference primitives
- **Component** (`cmp.*`) - Component-specific tokens that reference semantic tokens

## Installation

```bash
npm install @theta/tokens
```

## Usage

### React Native Usage
```js
import { tokens, getTokens } from '@theta/tokens/native';

// Access tokens directly (uses light theme)
console.log(tokens.sysColorActionPrimaryDefault);

// Or get theme-aware tokens
const themed = getTokens('dark');
console.log(themed.sysColorActionPrimaryDefault);
```

### Web Usage (CSS)
```css
/* Import base tokens and themes */
@import '@theta/tokens/css/base.css';
@import '@theta/tokens/css/themes/light.css';
@import '@theta/tokens/css/themes/dark.css';

/* Import component tokens as needed */
@import '@theta/tokens/css/components/button.css';

.button {
  background-color: var(--sys-color-action-primary-default);
  border-radius: var(--sys-radius-md);
}

/* Theme switching via data attribute */
<html data-theme="dark">
```


## Token Structure

Tokens are organized in JSON files under `src/tokens/`:
- `reference/` - Base values
- `semantic/base/` - Default theme tokens
- `semantic/dark/` - Dark theme overrides
- `component/` - Component-specific tokens

## Building

```bash
# Build all token outputs
npm run build

# Watch mode for development
npm run dev
```

Generated outputs:
- `dist/tokens.js` - React Native tokens (ES module)
- `dist/tokens.d.ts` - TypeScript definitions
- `dist/tokens.json` - Flattened JSON
- `dist/css/` - Modular CSS files

## Development

View the token documentation and visual examples:

```bash
npm run storybook
```

## License

UNLICENSED - Private package