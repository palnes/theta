import { getTokens } from '@theta/tokens/native';
import { useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeContext } from './ThemeProvider';

export type { Theme } from './ThemeProvider';

// Pre-create styles for light theme fallback
const fallbackStylesCache = new WeakMap<(tokens: ReturnType<typeof getTokens>) => any, any>();

/**
 * Creates themed StyleSheet styles using tokens from ThemeContext
 * Falls back to light theme if no ThemeProvider is present
 * @param stylesFn Function that receives tokens and returns styles
 * @returns Hook that returns themed StyleSheet
 */
export const createThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (tokens: ReturnType<typeof getTokens>) => T
) => {
  // Create a fallback version that doesn't use hooks
  const getFallbackStyles = () => {
    const cached = fallbackStylesCache.get(stylesFn);
    if (cached) return cached;

    const tokens = getTokens('light');
    const styles = StyleSheet.create(stylesFn(tokens));
    fallbackStylesCache.set(stylesFn, styles);
    return styles;
  };

  // Pre-compute fallback styles
  const fallbackStyles = getFallbackStyles();

  // Return the actual hook
  return () => {
    // Check if we're in a theme context by using useContext directly
    const context = useContext(ThemeContext);

    // Always call useMemo to satisfy hook rules
    const themedStyles = useMemo(() => {
      if (!context) {
        return fallbackStyles;
      }
      return StyleSheet.create(stylesFn(context.tokens));
    }, [context, stylesFn]);

    return themedStyles;
  };
};
