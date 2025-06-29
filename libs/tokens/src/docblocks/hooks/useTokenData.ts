import { useMemo } from 'react';
import { useTokenSystemConfig } from '../contexts/TokenSystemContext';
import { useTokens } from './useTokens';

interface UseTokenDataProps {
  tier?: string;
  category?: string;
  filter?: (token: any) => boolean;
}

/**
 * Hook that provides token data in legacy format for backward compatibility
 */
export const useTokenData = ({ tier, category, filter }: UseTokenDataProps) => {
  const config = useTokenSystemConfig();
  const { tokens, loading, error } = useTokens({ tier, category, filter });

  // Transform tokens to legacy TokenData format for backward compatibility
  const data = useMemo(() => {
    if (!tokens || tokens.length === 0) return null;

    // Group tokens by tier and category
    const tokenData: any = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalTokens: tokens.length,
        themes: config.themes || ['light', 'dark'],
        themeableTokens: tokens.filter((t) => t.isThemeable).length,
      },
    };

    // Initialize all tiers
    config.tiers.forEach((tierConfig) => {
      tokenData[tierConfig.id] = {};
    });

    // Group tokens
    tokens.forEach((token) => {
      const tokenTier = config.paths?.getTier ? config.paths.getTier(token.path) : null;
      const tokenCategory = config.paths?.getCategory ? config.paths.getCategory(token.path) : null;

      if (tokenTier && tokenCategory) {
        if (!tokenData[tokenTier]) {
          tokenData[tokenTier] = {};
        }
        if (!tokenData[tokenTier][tokenCategory]) {
          tokenData[tokenTier][tokenCategory] = [];
        }
        tokenData[tokenTier][tokenCategory].push(token);
      }
    });

    return tokenData;
  }, [tokens, config]);

  return { tokens, data, loading, error };
};
