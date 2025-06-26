import { useMemo } from 'react';
import {
  extractFontFamilies,
  extractFontSizes,
  extractFontWeights,
  extractLineHeights,
  getSemanticTypography,
} from '../tools/tokenHelpers';
import { useDocumentationData } from './useDocumentationData';

export function useTypographyTokens(type: 'reference' | 'semantic' = 'reference') {
  const { data, loading, error } = useDocumentationData();

  const tokens = useMemo(() => {
    if (!data) return null;

    if (type === 'reference') {
      return {
        fontFamilies: extractFontFamilies(data.ref?.fontFamily || []),
        fontSizes: extractFontSizes(data.ref?.fontSize || []),
        fontWeights: extractFontWeights(data.ref?.fontWeight || []),
        lineHeights: extractLineHeights(data.ref?.lineHeightPx || []),
      };
    }

    // Semantic typography
    return {
      categories: getSemanticTypography(data.sys?.typography || []),
    };
  }, [data, type]);

  return {
    tokens,
    loading,
    error,
  };
}
