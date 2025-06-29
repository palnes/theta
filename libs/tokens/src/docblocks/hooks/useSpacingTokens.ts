import { useMemo } from 'react';
import { VISUAL_SPACING_KEYS } from '../constants/displayConstants';
import { useTokens } from './useTokens';

/**
 * Hook for fetching spacing tokens with optional visual filtering
 */
export const useSpacingTokens = (visualOnly = false) => {
  const { tokens, loading, error } = useTokens({ tier: 'sys', category: 'spacing' });

  const filteredTokens = useMemo(() => {
    if (!visualOnly) return tokens;

    return tokens.filter((token) => {
      const key = token.path.split('.').pop() || '';
      return VISUAL_SPACING_KEYS.includes(key as any);
    });
  }, [tokens, visualOnly]);

  return { tokens: filteredTokens, loading, error };
};
