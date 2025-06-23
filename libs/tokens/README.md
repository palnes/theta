# @theta/tokens

Design tokens for the Theta design system, following the Design Token Community Group (DTCG) specification.

## Overview

This package contains all design tokens for the Theta design system and generates platform-specific outputs for web and native applications. The tokens follow a three-tier architecture:

- **Primitives** (`ref.*`) - Raw values like colors, dimensions, and typography
- **Semantic** (`sys.*`) - Context-aware tokens that reference primitives
- **Component** (`cmp.*`) - Component-specific tokens that reference semantic tokens

## Installation

```bash
npm install @theta/tokens
```

## Usage

### JavaScript/TypeScript
```js
import tokens from '@theta/tokens';

// Access tokens via dot notation
console.log(tokens.sys.color.action.primary.default);
```

### CSS
```css
@import '@theta/tokens/css';

.button {
  background-color: var(--sys-color-action-primary-default);
  border-radius: var(--sys-radius-md);
}
```

### CSS with Themes
```css
@import '@theta/tokens/css/themes';

/* Automatically includes theme-specific CSS custom properties */
```

## Token Structure

Tokens are organized in JSON files under `src/tokens/`:
- `primitives/` - Base values
- `semantic/` - System-level tokens
- `component/` - Component-specific tokens
- `themes/` - Theme variations

## Building

```bash
# Build all token outputs
npm run build

# Watch mode for development
npm run dev
```

Generated outputs:
- `dist/tokens.js` - ES module with all tokens
- `dist/tokens.d.ts` - TypeScript definitions
- `dist/tokens.css` - CSS custom properties
- `dist/tokens.json` - Flattened JSON
- `dist/css/themes.css` - Theme-specific CSS
- `dist/docs/tokens-reference.json` - Documentation data

## Development

View the token documentation and visual examples:

```bash
npm run storybook
```

## License

UNLICENSED - Private package