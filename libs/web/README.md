# @theta/web

React component library for the Theta design system.

## Setup

This package uses Vitest browser mode for testing React components in real browsers.

### Prerequisites

Before running tests, ensure you have Playwright installed:

```bash
yarn add -D playwright
```

If you're setting up a new environment, you may also need to install browser binaries:

```bash
npx playwright install chromium
```

## Development

```bash
# Start Storybook development server
yarn storybook

# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run unit tests only
yarn test:unit

# Run Storybook tests only
yarn test:stories

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage
```

## Building

```bash
# Build the component library
yarn build

# Build Storybook static site
yarn build-storybook
```

## Testing

This package uses a dual testing strategy:

1. **Unit tests** (`*.test.tsx`) - Component behavior testing using `vitest-browser-react`
2. **Story tests** (`*.stories.tsx`) - Integration testing with Storybook play functions

### Why vitest-browser-react?

We use `vitest-browser-react` instead of `@testing-library/react` because:
- It's designed specifically for Vitest browser mode
- Provides better integration with real browser testing
- Eliminates act warnings when testing React Aria Components
- Offers built-in visual regression testing capabilities

### Writing Tests

```typescript
import { render } from 'vitest-browser-react';
import { expect } from 'vitest';

test('component renders', async () => {
  const screen = render(<MyComponent />);
  await expect.element(screen.getByRole('button')).toBeVisible();
});
```

### Writing Story Tests

```typescript
import { fn } from 'storybook/test';
import { within, userEvent, expect } from 'storybook/test';

export const Interactive: Story = {
  args: {
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

## Architecture

- **Components** - React components using React Aria Components for accessibility
- **Styles** - CSS Modules with design tokens from `@theta/tokens`
- **Types** - Full TypeScript support with strict type checking
- **Testing** - Browser-based testing with visual regression support