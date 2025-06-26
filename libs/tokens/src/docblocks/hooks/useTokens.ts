import { useMemo } from 'react';
import type { TokenInfo } from '../types/tokenReferenceTable';
import { VISUAL_SPACING_KEYS } from '../constants/displayConstants';
import * as tokenHelpers from '../tools/tokenHelpers';
import { useDocumentationData } from './useDocumentationData';
import { getTokenDisplayConfig } from '../tools/tokenRegistry';

/**
 * Options for the unified useTokens hook
 */
export interface UseTokensOptions {
  // Basic filtering
  tier?: 'ref' | 'sys' | 'cmp' | 'all';
  category?: string | string[];

  // Advanced filtering
  filter?: (token: TokenInfo) => boolean;

  // Processing options
  process?: boolean; // Whether to run through extractors
  groupBy?: 'category' | 'tier' | 'path' | 'none';

  // Specific helpers
  visualOnly?: boolean; // For spacing tokens
  type?: 'reference' | 'semantic' | 'all'; // For color tokens
}

export interface TokensResult<T = any> {
  data: T;
  tokens: TokenInfo[];
  loading: boolean;
  error: string | null;
}

/**
 * Unified hook for all token data fetching needs
 * Replaces all specialized token hooks with a single flexible API
 */
export function useTokens<T = any>(options: UseTokensOptions = {}): TokensResult<T> {
  const {
    tier = 'all',
    category,
    filter,
    process = true,
    groupBy = 'none',
    visualOnly = false,
    type = 'all',
  } = options;

  const { data: rawData, loading, error } = useDocumentationData();

  const result = useMemo(() => {
    if (!rawData) {
      return { data: null as any, tokens: [] };
    }

    // Collect all matching tokens
    const allTokens: TokenInfo[] = [];
    const processedData: any = {};

    // Helper to process tokens for a specific tier/category
    const processTokens = (tierName: 'ref' | 'sys' | 'cmp', categoryName?: string) => {
      const tierData = rawData[tierName];
      if (!tierData) return;

      const categories = categoryName ? [categoryName] : Object.keys(tierData);

      categories.forEach((cat) => {
        const tokens = tierData[cat] || [];
        const matchingTokens = filter ? tokens.filter(filter) : tokens;
        allTokens.push(...matchingTokens);

        if (process && categoryName) {
          const config = getTokenDisplayConfig(tierName, cat);
          if (config) {
            const key = `${tierName}.${cat}`;
            processedData[key] = config.extractor(matchingTokens);
          }
        }
      });
    };

    // Determine which tiers to process
    const tiers: Array<'ref' | 'sys' | 'cmp'> = tier === 'all' ? ['ref', 'sys', 'cmp'] : [tier];

    // Process each tier
    tiers.forEach((t) => {
      if (Array.isArray(category)) {
        category.forEach((cat) => processTokens(t, cat));
      } else if (category) {
        processTokens(t, category);
      } else {
        processTokens(t);
      }
    });

    // Apply grouping if requested
    let finalData: any = process ? processedData : allTokens;

    if (groupBy !== 'none' && allTokens.length > 0) {
      const grouped: Record<string, TokenInfo[]> = {};

      allTokens.forEach((token) => {
        let key: string;
        switch (groupBy) {
          case 'category':
            key = token.path.split('.')[2] || 'uncategorized';
            break;
          case 'tier':
            key = token.path.split('.')[0] || 'unknown';
            break;
          case 'path':
            key = token.path.split('.').slice(0, -1).join('.');
            break;
          default:
            key = 'all';
        }

        if (!grouped[key]) grouped[key] = [];
        grouped[key]!.push(token);
      });

      finalData = grouped;
    }

    // Handle special cases for backward compatibility
    if (category === 'color' && type !== 'all') {
      const colorTokens = allTokens;
      finalData = {
        colorScales: type === 'reference' ? tokenHelpers.getColorScales(colorTokens) : [],
        specialColors: type === 'reference' ? tokenHelpers.getSpecialColors(colorTokens) : [],
        semanticColors: type === 'semantic' ? tokenHelpers.getSemanticColors(colorTokens) : [],
        allColorTokens: colorTokens,
      };
    }

    if (category === 'spacing' && visualOnly) {
      const filtered = allTokens.filter((t) => {
        const key = t.path.split('.').pop() || '';
        return VISUAL_SPACING_KEYS.includes(key as any);
      });
      finalData = tokenHelpers.getSemanticSpacing(filtered);
    }

    return { data: finalData, tokens: allTokens };
  }, [rawData, tier, category, filter, process, groupBy, visualOnly, type]);

  return {
    ...result,
    loading,
    error,
  };
}

/**
 * Convenience hooks for specific token types
 */
export const useColorTokens = (options: Omit<UseTokensOptions, 'category'> = {}) =>
  useTokens({ ...options, category: 'color' });

export const useSpacingTokens = (visualOnly = false) =>
  useTokens({ tier: 'sys', category: 'spacing', visualOnly });

export const useTypographyTokens = (tier: 'ref' | 'sys' = 'ref') =>
  useTokens({ tier, category: ['fontSize', 'fontWeight', 'lineHeight', 'fontFamily'] });

export const useBorderTokens = () => {
  const result = useTokens({ tier: 'sys', category: 'border' });
  // Extract the processed border data from the result
  const borderData = result.data ? (result.data as any)['sys.border'] : null;
  return {
    ...result,
    data: borderData,
  };
};

export const useShadowTokens = () => useTokens({ tier: 'sys', category: 'shadow' });

export const useRadiusTokens = () => useTokens({ tier: 'sys', category: 'radius' });

export const useDimensionTokens = () => useTokens({ tier: 'ref', category: 'dimension' });

/**
 * Hook to get all tokens for a specific theme comparison
 */
export const useThemeTokens = (themeName?: string) =>
  useTokens({
    tier: 'all',
    filter: (token) => token.isThemeable && (!themeName || token.themeValues?.[themeName]),
  });
