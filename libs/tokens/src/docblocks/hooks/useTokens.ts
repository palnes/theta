import { useMemo } from 'react';
import { useTokenSystemConfig, useTokenSystemData } from '../contexts/TokenSystemContext';
import type { TokenInfo } from '../types/tokenReferenceTable';

export interface UseTokensOptions {
  /** Tier ID(s) to filter by */
  tier?: string | string[] | 'all';
  /** Category to filter by */
  category?: string;
  /** Custom filter function */
  filter?: (token: TokenInfo) => boolean;
  /** Optional token data in TokenData format - if not provided, will use context */
  tokenData?: any;
}

/**
 * Hook to fetch tokens using the configuration system
 */
// Helper to get tier IDs based on tier parameter
const getTierIds = (tier: string | string[] | 'all', config: any): string[] => {
  if (tier === 'all') {
    return config.tiers.map((t: any) => t.id);
  }
  return Array.isArray(tier) ? tier : [tier];
};

// Helper to collect tokens from a single tier
const collectTokensFromTier = (tierData: any, category?: string): TokenInfo[] => {
  const tokens: TokenInfo[] = [];

  if (!tierData) return tokens;

  if (category) {
    // Get specific category from tier
    const categoryTokens = tierData[category];
    if (categoryTokens) {
      tokens.push(...categoryTokens);
    }
  } else {
    // Get all tokens from tier
    for (const categoryTokens of Object.values(tierData)) {
      if (Array.isArray(categoryTokens)) {
        tokens.push(...categoryTokens);
      }
    }
  }

  return tokens;
};

// Helper to sort tokens by sort order
const sortTokensBySortOrder = (tokens: TokenInfo[], sortOrder: string[]): TokenInfo[] => {
  return tokens.sort((a, b) => {
    const aIndex = sortOrder.indexOf(a.name);
    const bIndex = sortOrder.indexOf(b.name);

    if (aIndex === -1 && bIndex === -1) {
      return a.name.localeCompare(b.name);
    }
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
};

// Helper to sort tokens by path
const sortTokensByPath = (tokens: TokenInfo[]): TokenInfo[] => {
  return tokens.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
};

export const useTokens = (options: UseTokensOptions = {}) => {
  const { tier = 'all', category, filter, tokenData: providedTokenData } = options;
  const config = useTokenSystemConfig();
  const { data: contextData, loading, error } = useTokenSystemData();

  // Use provided tokenData (already in correct format) or fall back to context
  const data = providedTokenData || contextData;

  const tokens = useMemo(() => {
    if (!data) return [];

    // Determine which tiers to include
    const tierIds = getTierIds(tier, config);

    // Collect tokens from specified tiers
    let allTokens: TokenInfo[] = [];
    for (const tierId of tierIds) {
      const tierData = (data as any)[tierId];
      const tierTokens = collectTokensFromTier(tierData, category);
      allTokens.push(...tierTokens);
    }

    // Apply custom filter if provided
    if (filter) {
      allTokens = allTokens.filter(filter);
    }

    // Apply sorting based on configuration
    const sortOrder = config.display?.sortOrders?.[category || ''];
    if (sortOrder && category) {
      return sortTokensBySortOrder(allTokens, sortOrder);
    }

    // Default sort by path
    return sortTokensByPath(allTokens);
  }, [data, tier, category, filter, config]);

  return { tokens, loading, error };
};

/**
 * Create category-specific hooks dynamically based on configuration
 */
export const createCategoryHook = (categoryId: string, defaultTier?: string) => {
  return (options: Omit<UseTokensOptions, 'category'> = {}) => {
    return useTokens({
      ...options,
      category: categoryId,
      tier: options.tier || defaultTier || 'all',
    });
  };
};
