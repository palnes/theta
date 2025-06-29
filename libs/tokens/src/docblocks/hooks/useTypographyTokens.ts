import { useMemo } from 'react';
import { useDocumentationData } from './useDocumentationData';

export function useTypographyTokens(type: 'reference' | 'semantic' = 'reference') {
  const { data, loading, error } = useDocumentationData();

  const tokens = useMemo(() => {
    if (!data) return null;

    if (type === 'reference') {
      // Sort font sizes from large to small
      const fontSizes = [...(data.ref?.fontSize || [])].sort((a, b) => {
        const sizeA = Number.parseInt(a.name);
        const sizeB = Number.parseInt(b.name);
        return sizeB - sizeA;
      });

      // Filter to ensure we only get reference tokens
      const refFontFamilies = (data.ref?.fontFamily || []).filter((t) =>
        t.path?.startsWith('ref.')
      );
      const refFontSizes = fontSizes.filter((t) => t.path?.startsWith('ref.'));
      const refFontWeights = (data.ref?.fontWeight || []).filter((t) => t.path?.startsWith('ref.'));
      const refLineHeights = (data.ref?.lineHeightPx || []).filter((t) =>
        t.path?.startsWith('ref.')
      );

      return {
        fontFamilies: refFontFamilies,
        fontSizes: refFontSizes,
        fontWeights: refFontWeights,
        lineHeights: refLineHeights,
      };
    }

    // Semantic typography - return in same format as reference
    const sysTypography = data.sys?.typography || [];

    // Filter tokens by property type
    const fontSizes = sysTypography.filter((t) => t.path.endsWith('.fontSize'));
    const fontWeights = sysTypography.filter((t) => t.path.endsWith('.fontWeight'));
    const lineHeights = sysTypography.filter((t) => t.path.endsWith('.lineHeight'));
    const fontFamilies = sysTypography.filter((t) => t.path.endsWith('.fontFamily'));

    // Sort font sizes from large to small based on the token name
    const sortedFontSizes = [...fontSizes].sort((a, b) => {
      // Extract size from path like "sys.typography.xl.fontSize" -> "xl"
      const getSizeKey = (path: string) => path.split('.').slice(-2, -1)[0] || '';
      const sizeOrder = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs', '2xs'];
      const indexA = sizeOrder.indexOf(getSizeKey(a.path || ''));
      const indexB = sizeOrder.indexOf(getSizeKey(b.path || ''));
      return indexA - indexB;
    });

    return {
      fontFamilies,
      fontSizes: sortedFontSizes,
      fontWeights,
      lineHeights,
    };
  }, [data, type]);

  return {
    tokens,
    loading,
    error,
  };
}
