import { getTokens } from '@theta/tokens/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';

export type { Theme } from './ThemeProvider';

/**
 * Creates themed StyleSheet styles using tokens from ThemeContext
 * Falls back to light theme if no ThemeProvider is present
 * @param stylesFn Function that receives tokens and returns styles
 * @returns Hook that returns themed StyleSheet
 */
export const createThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (tokens: ReturnType<typeof getTokens>) => T
) => {
  return () => {
    try {
      const { tokens } = useTheme();
      return useMemo(() => StyleSheet.create(stylesFn(tokens)), [tokens, stylesFn]);
    } catch {
      const tokens = getTokens('light');
      return StyleSheet.create(stylesFn(tokens));
    }
  };
};
