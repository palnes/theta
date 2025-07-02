# Custom Configuration Guide

This guide shows how to create and use custom configurations for the token system.

## Where to Put Your Custom Configuration

### Option 1: Application-Level Configuration File (Recommended)

Create a configuration file in your application's source directory:

```typescript
// src/config/tokenSystemConfig.ts
import type { FlexibleTokenSystemConfig } from '@theta/tokens';

export const customTokenConfig: Partial<FlexibleTokenSystemConfig> = {
  // Override only what you need
  tiers: [
    { id: 'core', name: 'Core Tokens' },
    { id: 'semantic', name: 'Semantic Tokens' },
    { id: 'component', name: 'Component Tokens' },
  ],
  
  categories: [
    { id: 'color', name: 'Colors', icon: '🎨' },
    { id: 'spacing', name: 'Spacing', icon: '📏' },
    { id: 'typography', name: 'Typography', icon: '📝' },
  ],
  
  paths: {
    getTier: (path: string) => path.split('-')[0],
    getCategory: (path: string) => path.split('-')[1],
    separator: '-',
  },
};
```

### Option 2: Environment-Specific Configurations

For different environments or brands:

```typescript
// src/config/brands/brand-a.config.ts
export const brandAConfig: Partial<FlexibleTokenSystemConfig> = {
  themes: ['light', 'dark', 'high-contrast'],
  // Brand A specific configuration
};

// src/config/brands/brand-b.config.ts
export const brandBConfig: Partial<FlexibleTokenSystemConfig> = {
  themes: ['light', 'dark'],
  // Brand B specific configuration
};
```

## Using Your Custom Configuration

### With React Components

```tsx
// src/App.tsx
import { TokenSystemProvider } from '@theta/tokens';
import { customTokenConfig } from './config/tokenSystemConfig';
import tokenData from './generated/tokens.json';

function App() {
  return (
    <TokenSystemProvider config={customTokenConfig} data={tokenData}>
      {/* Your app content */}
    </TokenSystemProvider>
  );
}
```

### With Build Tools

```javascript
// build-tokens.js
import { buildTokens } from '@theta/tokens/tools';
import { customTokenConfig } from './src/config/tokenSystemConfig';

buildTokens({
  config: customTokenConfig,
  input: './src/tokens',
  output: './dist/tokens',
});
```

## Configuration Merging

Your custom configuration is automatically merged with the defaults:

```typescript
import { mergeWithDefaults } from '@theta/tokens';
import { customTokenConfig } from './config/tokenSystemConfig';

// This gives you the complete configuration with your overrides
const fullConfig = mergeWithDefaults(customTokenConfig);
```

## Examples

### Material Design Style Configuration

```typescript
const materialConfig: Partial<FlexibleTokenSystemConfig> = {
  tiers: [
    { id: 'sys', name: 'System' },
    { id: 'ref', name: 'Reference' },
    { id: 'comp', name: 'Component' },
  ],
  
  categories: [
    { id: 'color', name: 'Color' },
    { id: 'typography', name: 'Typography' },
    { id: 'shape', name: 'Shape' },
    { id: 'motion', name: 'Motion' },
    { id: 'elevation', name: 'Elevation' },
  ],
  
  themes: ['light', 'dark'],
};
```

### Tailwind Style Configuration

```typescript
const tailwindConfig: Partial<FlexibleTokenSystemConfig> = {
  tiers: [
    { id: 'base', name: 'Base' },
  ],
  
  sortOrders: {
    spacing: ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96'],
    fontSize: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'],
  },
  
  paths: {
    separator: '-',
    getTier: () => 'base',
    getCategory: (path: string) => {
      const parts = path.split('-');
      return parts[0];
    },
  },
};
```

## Best Practices

1. **Keep configurations in a dedicated directory** - This makes them easy to find and maintain.

2. **Use TypeScript** - Take advantage of type safety and autocompletion.

3. **Only override what you need** - The default configuration provides sensible defaults.

4. **Document your configuration** - Explain why certain choices were made.

5. **Version control your configuration** - Track changes over time.

6. **Test your configuration** - Ensure it works with your token structure.