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
// Helper to create metadata object
const createMetadata = (tokens: any[], config: any) => {
  return {
    generatedAt: new Date().toISOString(),
    totalTokens: tokens.length,
    themes: config.themes || ['light', 'dark'],
    themeableTokens: tokens.filter((t: any) => t.isThemeable).length,
  };
};

// Helper to initialize tier structure
const initializeTiers = (tokenData: any, config: any) => {
  for (const tierConfig of config.tiers) {
    tokenData[tierConfig.id] = {};
  }
};

// Helper to get token tier and category
const getTokenLocation = (token: any, config: any) => {
  const tier = config.paths?.getTier ? config.paths.getTier(token.path) : null;
  const category = config.paths?.getCategory ? config.paths.getCategory(token.path) : null;
  return { tier, category };
};

// Helper to add token to the appropriate tier/category
const addTokenToData = (tokenData: any, token: any, tier: string, category: string) => {
  if (!tokenData[tier]) {
    tokenData[tier] = {};
  }
  if (!tokenData[tier][category]) {
    tokenData[tier][category] = [];
  }
  tokenData[tier][category].push(token);
};

export const useTokenData = ({ tier, category, filter }: UseTokenDataProps) => {
  const config = useTokenSystemConfig();
  const { tokens, loading, error } = useTokens({ tier, category, filter });

  // Transform tokens to legacy TokenData format for backward compatibility
  const data = useMemo(() => {
    if (!tokens || tokens.length === 0) return null;

    // Create base structure with metadata
    const tokenData: any = {
      metadata: createMetadata(tokens, config),
    };

    // Initialize all tiers
    initializeTiers(tokenData, config);

    // Group tokens by tier and category
    for (const token of tokens) {
      const { tier: tokenTier, category: tokenCategory } = getTokenLocation(token, config);

      if (tokenTier && tokenCategory) {
        addTokenToData(tokenData, token, tokenTier, tokenCategory);
      }
    }

    return tokenData;
  }, [tokens, config]);

  return { tokens, data, loading, error };
};
