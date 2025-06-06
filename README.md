# Theta Design System

A monorepo containing design tokens and component libraries for web and React Native.

## Packages

- **@theta/tokens** - Design tokens (colors, typography, spacing, etc.)
- **@theta/web** - React component library for web applications
- **@theta/native** - React Native component library

## Prerequisites

- Node.js >= 22.0.0 (required for Style Dictionary v5)
- Yarn 4.x (included via corepack)

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

When developing with Theta in another local project, you have several options for linking:

### Method 1: Yarn Link (Recommended)

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

### Method 2: File Protocol

In your project's package.json:

```json
{
  "dependencies": {
    "@theta/web": "file:../path/to/theta/libs/web",
    "@theta/native": "file:../path/to/theta/libs/native"
  }
}
```

Then run `yarn install` in your project.

### Method 3: Yalc (For Complex Cases)

Yalc works better than yarn link for some scenarios:

```bash
# Install yalc globally
npm i -g yalc

# In theta package directory
cd libs/web
yalc publish

# In your project
yalc add @theta/web

# After making changes in theta
yalc push
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
├── libs/
│   ├── tokens/          # Design tokens (Style Dictionary)
│   ├── web/            # React components for web
│   └── native/         # React Native components
├── docs/               # End-user documentation
├── node_modules/       # Dependencies
├── package.json        # Workspace configuration
├── turbo.json         # Turborepo configuration
└── yarn.lock          # Lock file
```

## Architecture

This monorepo uses:
- **Yarn Workspaces** for package management
- **TypeScript** for type safety
- **Turborepo** for build orchestration
- **Style Dictionary v5** for design token management
- **Vite** for web bundling
- **Vitest** for testing
- **Storybook** for component development
- **Biome** for linting and formatting

## Troubleshooting

### Build Issues
- Clear all build artifacts: `yarn clean`
- Reinstall dependencies: `rm -rf node_modules && yarn install`
- Ensure Node.js version is >= 22.0.0

### Linking Issues
- Ensure you're using the same Node version in both projects
- Try unlinking and relinking
- Check that builds are up to date in the theta packages

### Type Issues
- Rebuild tokens first: `yarn workspace @theta/tokens build`
- Ensure TypeScript versions match across projects
- Check that @theta/tokens is built before other packages

## Testing

- **Web**: Vitest with browser mode for component testing
- **Native**: React Native Testing Library
- **Tokens**: Unit tests for transformations

See [Testing Setup Guide](./docs/testing-setup.md) for detailed testing information.

## Using the Design System

For documentation on using Theta components in your projects, see [docs/README.md](./docs/README.md).

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `yarn test`
4. Run linting: `yarn lint`
5. Submit a pull request

## License

Private