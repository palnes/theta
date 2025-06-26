# Theta Design System

A monorepo containing design tokens and component libraries for web and React Native.

## Packages

- **@theta/tokens** - Design tokens (colors, typography, spacing, etc.)
- **@theta/web** - React component library for web applications
- **@theta/native** - React Native component library

## Prerequisites

- Node.js >= 22.0.0
- Yarn 4.x (included via corepack)

## Getting Started

```bash
# Install dependencies
yarn install

# Build all packages (required before development)
yarn build

# Start development (runs all Storybooks)
yarn start
```

**Note:** The initial build is mandatory as packages depend on built artifacts from other packages (especially tokens).

### Available Commands

```bash
# Development
yarn start          # Run all Storybooks with live reload
yarn dev:tokens     # Watch and rebuild tokens
yarn dev:web        # Run web dev server  
yarn dev:native     # Run native dev server

# Quality checks
yarn quality        # Run all checks (format, typecheck, test)
yarn test           # Run tests
yarn lint           # Run linter
yarn format         # Format and lint code
yarn typecheck      # Type check TypeScript

# Build
yarn build          # Build all packages
yarn clean          # Clean all build artifacts
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
3. Run quality checks: `yarn quality`
4. Add a changeset: `yarn changeset`
5. Submit a pull request

## License

Private
