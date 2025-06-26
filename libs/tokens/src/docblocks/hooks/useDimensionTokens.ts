import { useMemo } from 'react';
import { extractDimensions, extractSpecialDimensions } from '../tools/tokenHelpers';
import type { NumericToken, StringToken } from '../types/tokens';
import { useDocumentationData } from './useDocumentationData';

export interface DimensionData {
  dimensions: NumericToken[];
  specials: StringToken[];
  maxNegative: number;
  maxPositive: number;
}

/**
 * Hook to process dimension tokens and calculate display metrics
 */
export function useDimensionTokens(): DimensionData {
  const { data } = useDocumentationData();

  return useMemo(() => {
    const dimensionTokens = data?.ref?.dimension || [];
    const dimensions = extractDimensions(dimensionTokens);
    const specials = extractSpecialDimensions(dimensionTokens);

    // Find the maximum negative value (most negative) and maximum positive value
    const negativeValues = dimensions.filter((d) => d.value < 0);
    const positiveValues = dimensions.filter((d) => d.value >= 0);

    const maxNegative =
      negativeValues.length > 0 ? Math.abs(Math.min(...negativeValues.map((d) => d.value))) : 0;

    const maxPositive =
      positiveValues.length > 0
        ? Math.max(...positiveValues.map((d) => d.value), 100) // Default max of 100
        : 100;

    return {
      dimensions,
      specials,
      maxNegative,
      maxPositive,
    };
  }, [data]);
}
