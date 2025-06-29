import React, { createContext, useContext } from 'react';
import { flattenRegistryTokens, groupTokensByCategory } from '../tools/registryAdapter';
import { DEFAULT_TOKEN_CONFIG, TokenSystemConfig } from '../types/TokenSystemConfig';
import { TokenData } from '../types/tokenReferenceTable';

interface TokenSystemContextValue {
  config: TokenSystemConfig;
  data: TokenData;
  loading?: boolean;
}

/**
 * Context for token system configuration and data
 */
export const TokenSystemContext = createContext<TokenSystemContextValue | null>(null);

/**
 * Provider component for token system configuration
 */
export interface TokenSystemProviderProps {
  config?: Partial<TokenSystemConfig>;
  data: any; // Registry data - REQUIRED
  children: React.ReactNode;
}

export const TokenSystemProvider: React.FC<TokenSystemProviderProps> = ({
  config,
  data: registryData,
  children,
}) => {
  // Merge provided config with defaults
  const mergedConfig: TokenSystemConfig = React.useMemo(
    () => ({
      ...DEFAULT_TOKEN_CONFIG,
      ...config,
      tiers: config?.tiers || DEFAULT_TOKEN_CONFIG.tiers,
      categories: config?.categories || DEFAULT_TOKEN_CONFIG.categories,
      themes: config?.themes || DEFAULT_TOKEN_CONFIG.themes,
      paths: {
        ...DEFAULT_TOKEN_CONFIG.paths,
        ...config?.paths,
      },
      formats: config?.formats
        ? {
            ...DEFAULT_TOKEN_CONFIG.formats,
            ...config.formats,
            formats: config.formats.formats || DEFAULT_TOKEN_CONFIG.formats?.formats || [],
          }
        : DEFAULT_TOKEN_CONFIG.formats,
      display: {
        ...DEFAULT_TOKEN_CONFIG.display,
        ...config?.display,
        sortOrders: {
          ...DEFAULT_TOKEN_CONFIG.display?.sortOrders,
          ...config?.display?.sortOrders,
        },
      },
    }),
    [config]
  );

  // Transform registry data to TokenData format synchronously
  const tokenData = React.useMemo(() => {
    if (!registryData) {
      throw new Error('TokenSystemProvider: data prop is required');
    }

    const transformedData: TokenData = {
      ref: {},
      sys: {},
      cmp: {},
      metadata: {
        generatedAt: registryData.metadata?.timestamp || new Date().toISOString(),
        totalTokens: registryData.metadata?.stats?.total || 0,
        themes: mergedConfig.themes || [],
        themeableTokens: 0,
      },
    };

    // Process each tier
    ['ref', 'sys', 'cmp'].forEach((tierName) => {
      const tierTokens = registryData.tokens[tierName as keyof typeof registryData.tokens];
      if (tierTokens) {
        const flatTokens = flattenRegistryTokens(tierTokens);
        // Filter tokens to ensure they belong to the correct tier
        const tierFilteredTokens = flatTokens.filter((token) =>
          token.id.startsWith(`${tierName}.`)
        );
        const grouped = groupTokensByCategory(tierFilteredTokens);

        // Additional filter for typography to remove expanded system tokens from ref
        if (tierName === 'ref' && grouped.typography) {
          grouped.typography = grouped.typography.filter(
            (t) => t.path?.startsWith('ref.') || false
          );
        }

        (transformedData as any)[tierName] = grouped;
      }
    });

    return transformedData;
  }, [registryData, mergedConfig.themes]);

  const contextValue: TokenSystemContextValue = {
    config: mergedConfig,
    data: tokenData,
    loading: false, // Data is provided directly, no loading needed
  };

  return <TokenSystemContext.Provider value={contextValue}>{children}</TokenSystemContext.Provider>;
};

/**
 * Hook to access token system configuration
 */
export const useTokenSystemConfig = () => {
  const context = useContext(TokenSystemContext);
  if (!context) {
    throw new Error('useTokenSystemConfig must be used within a TokenSystemProvider');
  }
  return context.config;
};

/**
 * Hook to access token system data
 */
export const useTokenSystemData = () => {
  const context = useContext(TokenSystemContext);
  if (!context) {
    throw new Error('useTokenSystemData must be used within a TokenSystemProvider');
  }
  return {
    data: context.data,
    loading: context.loading || false,
    error: null,
  };
};

/**
 * Hook to get tier configuration
 */
export const useTierConfig = () => {
  const config = useTokenSystemConfig();
  return {
    tiers: config.tiers,
    getTierById: (id: string) => config.tiers.find((tier) => tier.id === id),
    getTierName: (id: string) => config.tiers.find((tier) => tier.id === id)?.name || id,
    isValidTier: (id: string) => config.tiers.some((tier) => tier.id === id),
  };
};

/**
 * Hook to get category configuration
 */
export const useCategoryConfig = () => {
  const config = useTokenSystemConfig();
  return {
    categories: config.categories,
    getCategoryById: (id: string) => config.categories.find((cat) => cat.id === id),
    getCategoryName: (id: string) => config.categories.find((cat) => cat.id === id)?.name || id,
    isValidCategory: (id: string) => config.categories.some((cat) => cat.id === id),
  };
};

/**
 * Hook to get path parsing functions
 */
export const usePathConfig = () => {
  const config = useTokenSystemConfig();
  const { paths } = config;

  return {
    separator: paths?.separator || '.',
    getTier: paths?.getTier || ((path: string) => path.split('.')[0]),
    getCategory: paths?.getCategory || ((path: string) => path.split('.')[1]),
    getName: paths?.getName || ((path: string) => path.split('.').slice(-1)[0]),
    parsePath: (path: string) => {
      const getTier = paths?.getTier || ((p: string) => p.split('.')[0]);
      const getCategory = paths?.getCategory || ((p: string) => p.split('.')[1]);
      const getName = paths?.getName || ((p: string) => p.split('.').slice(-1)[0]);

      return {
        tier: getTier(path),
        category: getCategory(path),
        name: getName(path),
      };
    },
  };
};
