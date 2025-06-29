/**
 * Configuration for the token documentation system
 * Allows customization of token structure, tiers, and display behavior
 */

export interface TokenTierConfig {
  /** Unique identifier for the tier (e.g., 'ref', 'sys', 'cmp') */
  id: string;
  /** Display name for the tier */
  name: string;
  /** Description of the tier's purpose */
  description?: string;
  /** Order priority (lower numbers appear first) */
  order?: number;
}

export interface TokenCategoryConfig {
  /** Category identifier (e.g., 'color', 'spacing', 'typography') */
  id: string;
  /** Display name for the category */
  name: string;
  /** Expected token type for this category */
  type?: string;
  /** Custom renderer component name */
  renderer?: string;
  /** Sub-categories if applicable */
  subCategories?: string[];
}

export interface TokenPathConfig {
  /** Separator used in token paths (default: '.') */
  separator?: string;
  /** Function to parse tier from path */
  getTier?: (path: string) => string;
  /** Function to parse category from path */
  getCategory?: (path: string) => string;
  /** Function to parse token name from path */
  getName?: (path: string) => string;
}

export interface TokenFormatConfig {
  /** Available output formats */
  formats: Array<{
    id: string;
    label: string;
    /** Function to generate the format value from a token */
    getValue: (token: any) => string;
  }>;
  /** Default format to display */
  defaultFormat?: string;
}

export interface TokenDisplayConfig {
  /** Custom sort orders for specific token types */
  sortOrders?: {
    [key: string]: string[];
  };
  /** Group tokens by these properties */
  groupBy?: string[];
  /** Hide these token properties from display */
  hiddenProperties?: string[];
}

export interface TokenSystemConfig {
  /** Token tier configuration */
  tiers: TokenTierConfig[];
  /** Token category configuration */
  categories: TokenCategoryConfig[];
  /** Available themes */
  themes?: string[];
  /** Path parsing configuration */
  paths?: TokenPathConfig;
  /** Output format configuration */
  formats?: TokenFormatConfig;
  /** Display configuration */
  display?: TokenDisplayConfig;
  /** Custom token validators */
  validators?: {
    [key: string]: (token: any) => boolean;
  };
  /** Custom token transformers */
  transformers?: {
    [key: string]: (token: any) => any;
  };
}

/**
 * Default configuration for the ref/sys/cmp token system
 */
export const DEFAULT_TOKEN_CONFIG: TokenSystemConfig = {
  tiers: [
    { id: 'ref', name: 'Reference', description: 'Base design values', order: 1 },
    { id: 'sys', name: 'Semantic', description: 'Semantic design tokens', order: 2 },
    { id: 'cmp', name: 'Component', description: 'Component-specific tokens', order: 3 },
  ],
  themes: ['light', 'dark'],
  categories: [
    { id: 'color', name: 'Colors', type: 'color' },
    { id: 'spacing', name: 'Spacing', type: 'dimension' },
    { id: 'typography', name: 'Typography', type: 'typography' },
    { id: 'fontSize', name: 'Font Sizes', type: 'dimension' },
    { id: 'fontWeight', name: 'Font Weights', type: 'fontWeight' },
    { id: 'fontFamily', name: 'Font Families', type: 'fontFamily' },
    { id: 'lineHeight', name: 'Line Heights', type: 'dimension' },
    { id: 'lineHeightPx', name: 'Line Heights (px)', type: 'dimension' },
    { id: 'radius', name: 'Border Radius', type: 'dimension' },
    { id: 'border', name: 'Borders', type: 'border' },
    { id: 'shadow', name: 'Shadows', type: 'shadow' },
    { id: 'dimension', name: 'Dimensions', type: 'dimension' },
    { id: 'zIndex', name: 'Z-Index', type: 'zIndex' },
  ],
  paths: {
    separator: '.',
    getTier: (path) => path.split('.')[0] || '',
    getCategory: (path) => path.split('.')[1] || '',
    getName: (path) => path.split('.').slice(-1)[0] || '',
  },
  formats: {
    formats: [
      {
        id: 'css',
        label: 'CSS',
        getValue: (token) => token.usage?.find((u: any) => u.label === 'CSS')?.value || '',
      },
      {
        id: 'json',
        label: 'JSON',
        getValue: (token) => token.usage?.find((u: any) => u.label === 'JSON')?.value || '',
      },
      {
        id: 'js',
        label: 'JS',
        getValue: (token) => token.usage?.find((u: any) => u.label === 'JS')?.value || '',
      },
    ],
    defaultFormat: 'css',
  },
  display: {
    sortOrders: {
      fontSize: ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs', '2xs'],
      spacing: ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
  },
};
