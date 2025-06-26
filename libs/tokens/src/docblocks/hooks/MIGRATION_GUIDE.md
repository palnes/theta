# useTokens Hook Migration Guide

The new `useTokens` hook provides a unified API for all token data fetching needs, replacing multiple specialized hooks.

## Benefits

1. **Single API** - One hook to learn instead of many
2. **Flexible filtering** - Filter by tier, category, or custom function
3. **Built-in processing** - Automatic data transformation via token registry
4. **Grouping support** - Group tokens by category, tier, or path
5. **TypeScript support** - Full type inference

## Basic Usage

```typescript
import { useTokens } from '../hooks/useTokens';

// Get all tokens
const { data, tokens, loading, error } = useTokens();

// Get specific tier
const { data } = useTokens({ tier: 'sys' });

// Get specific category
const { data } = useTokens({ tier: 'sys', category: 'color' });

// Get multiple categories
const { data } = useTokens({ 
  tier: 'ref', 
  category: ['fontSize', 'fontWeight'] 
});
```

## Migration Examples

### Before: useColorTokens
```typescript
// Old
import { useColorTokens } from '../hooks/useColorTokens';
const { data, loading, error } = useColorTokens({ type: 'reference' });
```

### After: useTokens
```typescript
// New
import { useColorTokens } from '../hooks/useTokens';
const { data, loading, error } = useColorTokens({ type: 'reference' });
// Or directly:
const { data } = useTokens({ category: 'color', type: 'reference' });
```

### Before: useSpacingTokens
```typescript
// Old
import { useSpacingTokens } from '../hooks/useSpacingTokens';
const { tokens, loading, error } = useSpacingTokens(true); // visualOnly
```

### After: useTokens
```typescript
// New
import { useSpacingTokens } from '../hooks/useTokens';
const { data: tokens, loading, error } = useSpacingTokens(true);
```

### Before: Custom filtering
```typescript
// Old - required custom hook implementation
const tokens = data.sys?.border?.filter(token => token.isThemeable);
```

### After: Built-in filtering
```typescript
// New
const { tokens } = useTokens({
  tier: 'sys',
  category: 'border',
  filter: token => token.isThemeable
});
```

## Advanced Features

### Grouping
```typescript
// Group tokens by category
const { data } = useTokens({
  tier: 'sys',
  groupBy: 'category'
});
// Result: { color: [...], spacing: [...], ... }
```

### Multiple tiers
```typescript
// Get all themeable tokens across all tiers
const { tokens } = useTokens({
  tier: 'all',
  filter: token => token.isThemeable
});
```

### Raw tokens vs processed data
```typescript
// Get raw tokens without processing
const { tokens } = useTokens({ process: false });

// Get processed data (default)
const { data } = useTokens({ process: true });
```

## Convenience Hooks

For backward compatibility and common use cases:

```typescript
import { 
  useColorTokens,
  useSpacingTokens,
  useTypographyTokens,
  useBorderTokens,
  useShadowTokens,
  useRadiusTokens,
  useDimensionTokens,
  useThemeTokens 
} from '../hooks/useTokens';
```

## Component Example

See `SpacingDisplayNew.tsx` for a complete example of a migrated component.