# @theta/native

React Native component library for the Theta design system.

## Installation

```bash
npm install @theta/native @theta/tokens
```

### Optional: Theme Persistence
If you want theme preferences to persist across app restarts, install AsyncStorage:

```bash
npm install @react-native-async-storage/async-storage
```

## Usage

### Basic Setup
```tsx
import { ThemeProvider, Button } from '@theta/native';

function App() {
  return (
    <ThemeProvider defaultPreference="light">
      <Button variant="primary" size="medium" onPress={() => {}}>
        Hello Theta
      </Button>
    </ThemeProvider>
  );
}
```

### Styled Components (Recommended)
```tsx
import { createThemedStyles } from '@theta/native';

const useStyles = createThemedStyles((tokens) => ({
  container: {
    backgroundColor: tokens.sysColorSurfaceBaseDefault,
    borderRadius: tokens.sysRadiusMd,
  }
}));

function MyComponent() {
  const styles = useStyles();
  return <View style={styles.container} />;
}
```

## ThemeProvider

Wrap your app with `ThemeProvider` to enable theming:

```tsx
import { ThemeProvider } from '@theta/native';

function App() {
  return (
    <ThemeProvider 
      defaultPreference="system"  // 'light', 'dark', or 'system'
      persist={true}              // Save theme preference
    >
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Using Theme in Components
```tsx
import { useTheme } from '@theta/native';

function MyComponent() {
  const { theme, preference, setPreference, tokens } = useTheme();
  
  return (
    <View style={{ backgroundColor: tokens.sysColorSurfaceBaseDefault }}>
      <Button onPress={() => setPreference(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </Button>
    </View>
  );
}
```

## Development

```bash
# Start Expo development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android

# Run tests
yarn test

# Run Storybook
yarn storybook
```

## Components

- Button - Primary action component with variants and sizes
- More components coming soon...

## License

UNLICENSED - Private package