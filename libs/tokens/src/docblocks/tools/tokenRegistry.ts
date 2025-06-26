import type { TokenInfo } from '../types/tokenReferenceTable';
import * as tokenHelpers from './tokenHelpers';

export interface TokenDisplayConfig {
  category: string;
  extractor: (tokens: TokenInfo[]) => any;
  loadingMessage?: string;
  errorMessage?: string;
  displayType: 'list' | 'grid' | 'visual' | 'table';
}

/**
 * Unified token display registry
 * Maps token categories to their display configurations
 */
export const TOKEN_DISPLAY_REGISTRY: Record<string, TokenDisplayConfig> = {
  // Reference tokens
  'ref.fontSize': {
    category: 'fontSize',
    extractor: tokenHelpers.extractFontSizes,
    displayType: 'list',
  },
  'ref.fontWeight': {
    category: 'fontWeight',
    extractor: tokenHelpers.extractFontWeights,
    displayType: 'list',
  },
  'ref.lineHeightPx': {
    category: 'lineHeightPx',
    extractor: tokenHelpers.extractLineHeights,
    displayType: 'list',
  },
  'ref.fontFamily': {
    category: 'fontFamily',
    extractor: tokenHelpers.extractFontFamilies,
    displayType: 'list',
  },
  'ref.dimension': {
    category: 'dimension',
    extractor: tokenHelpers.extractDimensions,
    displayType: 'visual',
  },
  'ref.color': {
    category: 'color',
    extractor: tokenHelpers.getColorScales,
    displayType: 'grid',
  },

  // Semantic tokens
  'sys.spacing': {
    category: 'spacing',
    extractor: tokenHelpers.getSemanticSpacing,
    displayType: 'visual',
  },
  'sys.radius': {
    category: 'radius',
    extractor: tokenHelpers.getSemanticRadius,
    displayType: 'grid',
  },
  'sys.shadow': {
    category: 'shadow',
    extractor: tokenHelpers.getSemanticShadows,
    displayType: 'grid',
  },
  'sys.border': {
    category: 'border',
    extractor: tokenHelpers.getSemanticBorders,
    displayType: 'table',
  },
  'sys.zIndex': {
    category: 'zIndex',
    extractor: tokenHelpers.getSemanticZIndex,
    displayType: 'visual',
  },
  'sys.color': {
    category: 'color',
    extractor: tokenHelpers.getSemanticColors,
    displayType: 'grid',
  },
  'sys.typography': {
    category: 'typography',
    extractor: tokenHelpers.getSemanticTypography,
    displayType: 'list',
  },
};

/**
 * Get display configuration for a token path
 */
export function getTokenDisplayConfig(
  tier: string,
  category: string
): TokenDisplayConfig | undefined {
  return TOKEN_DISPLAY_REGISTRY[`${tier}.${category}`];
}

/**
 * Get all categories for a tier
 */
export function getTokenCategories(tier: 'ref' | 'sys' | 'cmp'): string[] {
  return Object.keys(TOKEN_DISPLAY_REGISTRY)
    .filter((key) => key.startsWith(`${tier}.`))
    .map((key) => key.split('.')[1])
    .filter((category): category is string => category !== undefined);
}
