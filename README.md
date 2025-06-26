# Theta Design System

A monorepo containing design tokens and component libraries for web and React Native.

## Packages

- **@theta/tokens** - Design tokens (colors, typography, spacing, etc.)
- **@theta/web** - React component library for web applications
- **@theta/native** - React Native component library

## Prerequisites

- Node.js >= 22.0.0
- Yarn 4.x (included via corepack)

## Quick Start

### Web Application

```tsx
// 1. Import CSS tokens in your app entry
import "@theta/tokens/css/base.css";
import "@theta/tokens/css/themes/light.css";
import "@theta/tokens/css/themes/dark.css";

// 2. Use components
import { Button } from "@theta/web";

// 3. Apply theme via data attribute
function App() {
  return (
    <div data-theme="dark">
      <Button variant="primary">Click me</Button>
    </div>
  );
}
```

### React Native Application

```tsx
// 1. Import and setup ThemeProvider
import { ThemeProvider, Button } from "@theta/native";

// 2. Wrap your app
function App() {
  return (
    <ThemeProvider defaultPreference="system">
      <Button variant="primary" onPress={() => {}}>
        Click me
      </Button>
    </ThemeProvider>
  );
}
```

## Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Build All Packages

```bash
yarn build
```

### 3. Available Commands

```bash
# Run tokens Storybook
yarn workspace @theta/tokens storybook

# Run web Storybook (when available)
yarn workspace @theta/web storybook

# Run tests
yarn test

# Lint and format
yarn lint
yarn format

# Build specific package
yarn workspace @theta/web build
yarn workspace @theta/native build
yarn workspace @theta/tokens build
```

## Local Development with Other Projects

Link Theta packages to your local project for real-time development:

```bash
# In theta monorepo root
cd libs/web && yarn link
cd ../native && yarn link
cd ../tokens && yarn link

# In your project
yarn link @theta/web
yarn link @theta/native
yarn link @theta/tokens
```

## Development Workflow

1. Make changes in Theta packages
2. Run `yarn build` in the package directory (or root for all)
3. Changes reflect immediately in linked projects
4. For automatic rebuilds:
   ```bash
   yarn workspace @theta/tokens build:watch
   ```

## Project Structure

```
theta/
└── libs/
    ├── tokens/        # Design tokens (Terrazzo)
    ├── web/           # React components for web
    └── native/        # React Native components
```

## Architecture

This monorepo uses:

- **Yarn Workspaces** for package management
- **TypeScript** for type safety
- **Turborepo** for build orchestration
- **Terrazzo** for DTCG-compliant design tokens
- **Vite** for web bundling
- **Vitest** for testing
- **Storybook** for component development
- **Biome** for linting and formatting

### Token System

The design system uses a three-tier token architecture:

- **Reference tokens** (`ref.*`) - Raw design values
- **Semantic tokens** (`sys.*`) - Theme-aware tokens that reference primitives
- **Component tokens** (`cmp.*`) - Component-specific tokens

Tokens support light and dark themes out of the box, with different implementations:

- **Web**: CSS custom properties with `data-theme` attribute
- **Native**: JavaScript objects with `ThemeProvider` context

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `yarn test`
4. Run linting: `yarn lint`
5. Submit a pull request

## License

Private
