# Web Platform Guide

Specific considerations for using Theta components in web applications.

## Setup

Theta web components are built with React and require:
- React 18+
- Modern browsers (Chrome, Firefox, Safari, Edge)

## Styling

### CSS Custom Properties

All design tokens are available as CSS custom properties:

```css
.custom-element {
  color: var(--sys-color-text-primary);
  padding: var(--sys-spacing-md);
}
```

### Styled Components

Components work seamlessly with styled-components:

```jsx
import styled from 'styled-components';
import { Button } from '@theta/web';

const CustomButton = styled(Button)`
  box-shadow: var(--sys-shadow-md);
`;
```

## Responsive Design

### Breakpoints

Components use standard breakpoints:
- `base`: 0px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Responsive Props

Many components accept responsive values:

```jsx
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</Grid>
```

## Accessibility

### Built-in Features

- Semantic HTML elements
- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

### Additional Considerations

- Ensure proper heading hierarchy
- Provide alt text for images
- Test with keyboard only
- Use sufficient color contrast
- Test with screen readers

## Performance

### Code Splitting

Components support tree-shaking:

```jsx
// Only imports Button, not entire library
import { Button } from '@theta/web';
```

### Lazy Loading

For route-based splitting:

```jsx
const Settings = lazy(() => import('./pages/Settings'));
```

## Server-Side Rendering

Components work with Next.js and other SSR frameworks:

```jsx
// Next.js app directory
import { Button } from '@theta/web';

export default function Page() {
  return <Button>Server Rendered</Button>;
}
```

## Browser Support

Theta supports modern browsers:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

Features requiring polyfills:
- CSS Container Queries
- CSS Logical Properties

## Common Patterns

### Theme Provider

Wrap your app for theme support:

```jsx
import { ThemeProvider } from '@theta/web';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Global Styles

Reset styles if needed:

```jsx
import { GlobalStyles } from '@theta/web';

function App() {
  return (
    <>
      <GlobalStyles />
      <YourApp />
    </>
  );
}
```

## Testing

### Component Testing

```jsx
import { render, screen } from '@testing-library/react';
import { Button } from '@theta/web';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Visual Testing

Components work with visual testing tools:
- Storybook
- Chromatic
- Percy

## Known Limitations

1. **CSS-in-JS runtime** - Some dynamic styles require JavaScript
2. **Container queries** - Requires modern browser or polyfill
3. **Subgrid** - Not used due to browser support

## Migration Guide

### From Other Systems

1. **Replace components gradually** - Start with leaf components
2. **Update spacing** - Use Stack/Inline instead of margins
3. **Remove custom tokens** - Use Theta tokens
4. **Test thoroughly** - Ensure behavior matches