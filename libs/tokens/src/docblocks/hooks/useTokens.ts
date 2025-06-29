import { useMemo } from 'react';
import { useTokenSystemConfig, useTokenSystemData } from '../contexts/TokenSystemContext';
import { TokenInfo } from '../types/tokenReferenceTable';

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
export const useTokens = (options: UseTokensOptions = {}) => {
  const { tier = 'all', category, filter, tokenData: providedTokenData } = options;
  const config = useTokenSystemConfig();
  const { data: contextData, loading, error } = useTokenSystemData();

  // Use provided tokenData (already in correct format) or fall back to context
  const data = providedTokenData || contextData;

  const tokens = useMemo(() => {
    if (!data) return [];

    let allTokens: TokenInfo[] = [];

    // Determine which tiers to include
    const tierIds =
      tier === 'all' ? config.tiers.map((t) => t.id) : Array.isArray(tier) ? tier : [tier];

    // Collect tokens from specified tiers
    tierIds.forEach((tierId) => {
      const tierData = (data as any)[tierId];
      if (!tierData) return;

      if (category) {
        // Get specific category from tier
        const categoryTokens = tierData[category];
        if (categoryTokens) {
          allTokens.push(...categoryTokens);
        }
      } else {
        // Get all tokens from tier
        Object.values(tierData).forEach((categoryTokens: any) => {
          if (Array.isArray(categoryTokens)) {
            allTokens.push(...categoryTokens);
          }
        });
      }
    });

    // Apply custom filter if provided
    if (filter) {
      allTokens = allTokens.filter(filter);
    }

    // Apply sorting based on configuration
    const sortOrder = config.display?.sortOrders?.[category || ''];
    if (sortOrder && category) {
      allTokens.sort((a, b) => {
        const aIndex = sortOrder.indexOf(a.name);
        const bIndex = sortOrder.indexOf(b.name);

        if (aIndex === -1 && bIndex === -1) {
          return a.name.localeCompare(b.name);
        }
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    } else {
      // Default sort by path
      allTokens.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
    }

    return allTokens;
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
