import React, { createContext, useContext } from 'react';
import { mergeWithDefaults } from '../config/defaultTokenSystemConfig';
import { flattenRegistryTokens, groupTokensByCategory } from '../tools/registryAdapter';
import type { FlexibleTokenSystemConfig } from '../types/FlexibleTokenSystemConfig';
import type { TokenData } from '../types/tokenReferenceTable';

interface TokenSystemContextValue {
  config: FlexibleTokenSystemConfig;
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
  config?: Partial<FlexibleTokenSystemConfig>;
  data: any; // Registry data - REQUIRED
  children: React.ReactNode;
}

// Helper function to create metadata
const createTokenMetadata = (registryData: any, themes: string[]): TokenData['metadata'] => ({
  generatedAt: registryData.metadata?.timestamp || new Date().toISOString(),
  totalTokens: registryData.metadata?.stats?.total || 0,
  themes: themes || [],
  themeableTokens: 0,
});

// Helper function to filter typography tokens for reference tier
const filterReferenceTypography = (
  grouped: any,
  tierId: string,
  pathConfig: FlexibleTokenSystemConfig['paths']
) => {
  if (pathConfig.isReference?.(tierId) && grouped.typography) {
    grouped.typography = grouped.typography.filter(
      (t: any) => pathConfig.isReference?.(t.path || '') || false
    );
  }
};

// Helper function to process a single tier
const processTier = (
  tier: any,
  registryData: any,
  pathConfig: FlexibleTokenSystemConfig['paths']
) => {
  const tierTokens = registryData.tokens[tier.id as keyof typeof registryData.tokens];
  if (!tierTokens) return null;

  const flatTokens = flattenRegistryTokens(tierTokens);
  const tierFilteredTokens = flatTokens.filter((token) => pathConfig.getTier(token.id) === tier.id);
  const grouped = groupTokensByCategory(tierFilteredTokens);

  filterReferenceTypography(grouped, tier.id, pathConfig);
  return grouped;
};

export const TokenSystemProvider: React.FC<TokenSystemProviderProps> = ({
  config,
  data: registryData,
  children,
}) => {
  // Merge provided config with defaults using the helper function
  const mergedConfig = React.useMemo(() => mergeWithDefaults(config), [config]);

  // Transform registry data to TokenData format synchronously
  const tokenData = React.useMemo(() => {
    if (!registryData) {
      throw new Error('TokenSystemProvider: data prop is required');
    }

    const transformedData: TokenData = {
      metadata: createTokenMetadata(registryData, mergedConfig.themes),
    } as any;

    // Initialize and process tiers
    for (const tier of mergedConfig.tiers) {
      (transformedData as any)[tier.id] = {};
      const processedTier = processTier(tier, registryData, mergedConfig.paths);
      if (processedTier) {
        (transformedData as any)[tier.id] = processedTier;
      }
    }

    return transformedData;
  }, [registryData, mergedConfig.themes, mergedConfig.tiers, mergedConfig.paths]);

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
