# Theta Design System Documentation

Learn how to build consistent, beautiful interfaces with Theta components.

## Overview

Theta is a component-first design system that provides:
- Pre-built, accessible components
- Consistent design tokens
- Cross-platform support (web and native)

## Quick Links

- [Getting Started](./getting-started.md) - Start building immediately
- [Design Philosophy](./philosophy.md) - Understand our component-first approach
- [Component Patterns](./patterns/) - Common UI patterns and examples
- [Platform Guides](./platforms/) - Platform-specific considerations
- [Troubleshooting](./troubleshooting.md) - Solutions to common issues

## Core Concepts

### Component-First Approach

Theta provides pre-built components that encapsulate design decisions. You can simply use the components without needing to understand design tokens or make visual decisions.

```jsx
// Use pre-built components
import { Button, Card, Stack, Text } from '@theta/web';

// Components handle all design decisions
<Card>
  <Stack spacing="md">
    <Text variant="heading">Hello</Text>
    <Button variant="primary">Click me</Button>
  </Stack>
</Card>
```

### Available Packages

- **@theta/web** - React components for web applications
- **@theta/native** - React Native components
- **@theta/tokens** - Design tokens (used internally by components)

## Getting Help

- Check our [Troubleshooting Guide](./troubleshooting.md)
- Review [Common Patterns](./patterns/)
- Ask in your team's design system channel