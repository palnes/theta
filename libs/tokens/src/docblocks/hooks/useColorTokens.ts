import { UseTokensOptions, useTokens } from './useTokens';

/**
 * Convenience hook for fetching color tokens
 */
export const useColorTokens = (options: Omit<UseTokensOptions, 'category'> = {}) => {
  const tier = options.tier || 'all';
  return useTokens({ tier, category: 'color', filter: options.filter });
};
