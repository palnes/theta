import { useMemo } from 'react';
import { SPACING_KEYS, VISUAL_SPACING_KEYS } from '../constants/displayConstants';
import { getSemanticSpacing } from '../tools/tokenHelpers';
import { useDocumentationData } from './useDocumentationData';

export interface SpacingToken {
  key: string;
  value: string | number;
  tokenValue: string;
  cssVariable: string;
  jsPath: string;
  jsFlat?: string;
}

export function useSpacingTokens(visualOnly = false) {
  const { data, loading, error } = useDocumentationData();

  const spacingTokens = useMemo(() => {
    if (!data?.sys?.spacing) return [];

    const allSpacingTokens = getSemanticSpacing(data.sys.spacing);

    return allSpacingTokens.filter(({ key }) =>
      visualOnly
        ? VISUAL_SPACING_KEYS.includes(key as (typeof VISUAL_SPACING_KEYS)[number])
        : SPACING_KEYS.includes(key as (typeof SPACING_KEYS)[number])
    );
  }, [data, visualOnly]);

  return {
    tokens: spacingTokens,
    loading,
    error,
  };
}
