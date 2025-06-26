import { useMemo } from 'react';
import { getSemanticTypography } from '../tools/tokenHelpers';
import type { TypographyCategory } from '../types/tokens';
import { useDocumentationData } from './useDocumentationData';

export interface SemanticTypographyData {
  categories: TypographyCategory[];
  categoryMap: Record<string, TypographyCategory>;
  labels: Record<string, string>;
  sampleText: Record<string, string>;
}

/**
 * Hook for semantic typography tokens with metadata
 */
export function useSemanticTypography() {
  const { data, loading, error } = useDocumentationData();

  const typographyData = useMemo(() => {
    if (!data?.sys?.typography) return null;

    const categories = getSemanticTypography(data.sys.typography);

    // Create a map for easy access by category name
    const categoryMap = categories.reduce(
      (acc, cat) => {
        acc[cat.category] = cat;
        return acc;
      },
      {} as Record<string, TypographyCategory>
    );

    // Category labels
    const labels: Record<string, string> = {
      heading: 'Heading Styles',
      body: 'Body Styles',
      action: 'Action Styles',
      label: 'Label Styles',
      code: 'Code Styles',
    };

    // Sample text for each category
    const sampleText: Record<string, string> = {
      heading: 'The quick brown fox jumps over the lazy dog',
      body: 'The quick brown fox jumps over the lazy dog. This is sample text that demonstrates the typography style.',
      action: 'Action Text',
      label: 'Label Text',
      code: 'const example = "Hello World";',
    };

    return {
      categories,
      categoryMap,
      labels,
      sampleText,
    };
  }, [data]);

  return {
    data: typographyData,
    loading,
    error,
  };
}
