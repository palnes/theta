import { useEffect, useState } from 'react';
import { TokenData } from '../types/tokenReferenceTable';
import { useRegistryData } from './useRegistryData';
import { flattenRegistryTokens, groupTokensByCategory } from '../tools/registryAdapter';

export const useDocumentationData = () => {
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
      }
    });

    setData(transformedData);
  }, [registryData]);

  return { data, loading, error };
};
