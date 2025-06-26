import { useMemo } from 'react';
import type { TokenInfo } from '../types/tokenReferenceTable';
import { getColorScales, getSemanticColors, getSpecialColors } from '../tools/tokenHelpers';
import type { ColorScale, SemanticColorCategory, SpecialColorToken } from '../types/tokens';
import { useDocumentationData } from './useDocumentationData';

export interface ColorTokenData {
  colorScales: ColorScale[];
  specialColors: SpecialColorToken[];
  semanticColors: SemanticColorCategory[];
  allColorTokens: TokenInfo[];
}

export interface UseColorTokensOptions {
  type?: 'reference' | 'semantic' | 'all';
}

/**
 * Hook to process and organize color tokens
 */
export function useColorTokens(options: UseColorTokensOptions = {}) {
  const { type = 'all' } = options;
  const { data, loading, error } = useDocumentationData();

  const colorData = useMemo(() => {
    if (!data) return null;

    const result: ColorTokenData = {
      colorScales: [],
      specialColors: [],
      semanticColors: [],
      allColorTokens: [],
    };

    // Reference colors
    if (type === 'reference' || type === 'all') {
      const refColors = data.ref?.color || [];
      result.colorScales = getColorScales(refColors);
      result.specialColors = getSpecialColors(refColors);
      result.allColorTokens = [...result.allColorTokens, ...refColors];
    }

    // Semantic colors
    if (type === 'semantic' || type === 'all') {
      const sysColors = data.sys?.color || [];
      result.semanticColors = getSemanticColors(sysColors);
      result.allColorTokens = [...result.allColorTokens, ...sysColors];
    }

    return result;
  }, [data, type]);

  return {
    data: colorData,
    loading,
    error,
  };
}

/**
 * Hook for semantic color tokens with category filtering
 */
export function useSemanticColorTokens() {
  const { data, loading, error } = useDocumentationData();

  const categorizedColors = useMemo(() => {
    if (!data?.sys?.color) return null;

    const categories: Record<string, { label: string; tokens: TokenInfo[] }> = {
      action: { label: 'Action Colors', tokens: [] },
      interaction: { label: 'Interaction Colors', tokens: [] },
      surface: { label: 'Surface Colors', tokens: [] },
      status: { label: 'Status Colors', tokens: [] },
      text: { label: 'Text Colors', tokens: [] },
      border: { label: 'Border Colors', tokens: [] },
      icon: { label: 'Icon Colors', tokens: [] },
    };

    // Sort tokens into categories
    data.sys.color.forEach((token: TokenInfo) => {
      const pathParts = token.path.split('.');
      if (pathParts.length >= 3) {
        const category = pathParts[2];
        if (category && categories[category]) {
          categories[category].tokens.push(token);
        }
      }
    });

    return categories;
  }, [data]);

  return {
    categories: categorizedColors,
    loading,
    error,
  };
}
