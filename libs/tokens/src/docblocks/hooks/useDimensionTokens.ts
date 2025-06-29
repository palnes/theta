import { useMemo } from 'react';
import { extractDimensions, extractSpecialDimensions } from '../tools/tokenHelpers';
import { useTokens } from './useTokens';

/**
 * Hook for dimension tokens with special processing
 * Maintains the old API for backward compatibility
 */
export function useDimensionTokens() {
  const { tokens, loading, error } = useTokens({ tier: 'ref', category: 'dimension' });

  const processedData = useMemo(() => {
    if (!tokens || tokens.length === 0) {
      return {
        dimensions: [],
        specials: [],
        maxNegative: 0,
        maxPositive: 0,
      };
    }

    const dimensions = extractDimensions(tokens);
    const specials = extractSpecialDimensions(tokens);

    // Find the most negative value (smallest value)
    const mostNegative = dimensions.reduce((min, d) => (d.value < min ? d.value : min), 0);
    // maxNegative should be the absolute value of the most negative number
    const maxNegative = Math.abs(mostNegative);

    // Find the most positive value
    const maxPositive = dimensions.reduce((max, d) => (d.value > max ? d.value : max), 0);

    return {
      dimensions,
      specials,
      maxNegative,
      maxPositive,
    };
  }, [tokens]);

  return {
    dimensions: processedData.dimensions,
    specials: processedData.specials,
    maxNegative: processedData.maxNegative,
    maxPositive: processedData.maxPositive,
    loading,
    error,
  };
}
