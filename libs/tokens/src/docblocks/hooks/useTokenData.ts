import { useEffect, useState } from 'react';
import { useRegistryData } from './useRegistryData';
import { flattenRegistryTokens, groupTokensByCategory } from '../tools/registryAdapter';
import { TokenData, TokenInfo } from '../types/tokenReferenceTable';

interface UseTokenDataProps {
  tier?: 'ref' | 'sys' | 'cmp';
  category?: string;
  filter?: (token: TokenInfo) => boolean;
}

export const useTokenData = ({ tier, category, filter }: UseTokenDataProps) => {
  const { data: registryData, loading, error } = useRegistryData();
  const [data, setData] = useState<TokenData | null>(null);

  useEffect(() => {
    if (!registryData) return;

    // Transform registry data to TokenData format
    const transformedData: TokenData = {
      ref: {},
      sys: {},
      cmp: {},
      metadata: {
        generatedAt: registryData.metadata?.timestamp || new Date().toISOString(),
        totalTokens: registryData.metadata?.stats?.total || 0,
        themes: ['light', 'dark'],
        themeableTokens: 0,
      },
    };

    // Process each tier
    ['ref', 'sys', 'cmp'].forEach((tierName) => {
      const tierTokens = registryData.tokens[tierName as keyof typeof registryData.tokens];
      if (tierTokens) {
        const flatTokens = flattenRegistryTokens(tierTokens);
        const grouped = groupTokensByCategory(flatTokens);
        (transformedData as any)[tierName] = grouped;

        // Debug log for ref tier
        if (tierName === 'ref' && grouped.dimension) {
          console.log(`Found ${grouped.dimension.length} dimension tokens in ref tier`);
        }
      }
    });

    setData(transformedData);
  }, [registryData]);

  // Get tokens based on tier and category
  let tokens: TokenInfo[] = [];

  if (data) {
    if (tier && category && data[tier] && data[tier][category]) {
      tokens = data[tier][category];
    } else if (tier && !category) {
      // Get all tokens from tier
      tokens = Object.values(data[tier] || {}).flat();
    } else {
      // Get all tokens
      tokens = [
        ...Object.values(data.ref || {}).flat(),
        ...Object.values(data.sys || {}).flat(),
        ...Object.values(data.cmp || {}).flat(),
      ];
    }

    // Apply custom filter if provided
    if (filter) {
      tokens = tokens.filter(filter);
    }

    // Sort tokens with natural ordering (handles numbers correctly)
    tokens.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
  }

  return { tokens, loading, error };
};
