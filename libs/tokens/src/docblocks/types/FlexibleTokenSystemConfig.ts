/**
 * Comprehensive configuration types for the flexible token system
 */

export interface TierConfig {
  /** Unique identifier for the tier (e.g., 'ref', 'sys', 'cmp') */
  id: string;
  /** Display name for the tier */
  name: string;
  /** Description of the tier's purpose */
  description?: string;
}

export interface CategoryConfig {
  /** Category identifier (e.g., 'color', 'spacing', 'typography') */
  id: string;
  /** Display name for the category */
  name: string;
  /** Optional icon for UI display */
  icon?: string;
}

export interface TypeConfig {
  /** Whether this type is composite (expands into multiple properties) */
  composite?: boolean;
  /** Properties for composite types */
  properties?: string[];
  /** Associated category */
  category?: string;
  /** Available formats for this type */
  formats?: string[];
  /** Available units for dimension types */
  units?: string[];
  /** Whether this type can be an array */
  array?: boolean;
  /** Predefined values (e.g., font weight mappings) */
  values?: Record<string, number>;
}

export interface PathConfig {
  /** Pattern for validating token paths */
  pattern?: RegExp;
  /** Separator used in token paths (default: '.') */
  separator?: string;
  /** Extract tier from path */
  getTier: (path: string) => string | null;
  /** Extract category from path */
  getCategory: (path: string) => string | null;
  /** Extract subcategory from path */
  getSubcategory?: (path: string) => string | null;
  /** Extract token name from path */
  getName?: (path: string) => string;
  /** Check if path represents a component token */
  isComponent?: (path: string) => boolean;
  /** Extract component name from path */
  getComponent?: (path: string) => string | null;
  /** Check if path represents a reference token */
  isReference?: (path: string) => boolean;
  /** Check if path represents a semantic token */
  isSemantic?: (path: string) => boolean;
}

export interface DisplayConfig {
  /** How to group tokens in the UI */
  groupBy: Record<string, 'subcategory' | 'property' | 'none'>;
  /** Order of groups */
  groupOrder?: Record<string, string[]>;
  /** Preview type for each category */
  preview?: Record<string, string>;
  /** Legacy - sort orders (moved to top level) */
  sortOrders?: Record<string, string[]>;
  /** Component-specific display configurations */
  components?: {
    spacing?: {
      visualDisplayKeys?: string[];
      keyLabels?: Record<string, string>;
    };
    typography?: {
      fontWeightLabels?: Record<string, string>;
    };
  };
}

export interface FileConfig {
  /** Source file patterns */
  sources?: string[];
  /** Output configurations */
  outputs: {
    css?: {
      buildPath: string;
      files: {
        base?: string;
        components?: string;
        themes?: string;
      };
    };
    js?: {
      buildPath: string;
      filename: string;
    };
    json?: {
      buildPath: string;
      filename: string;
    };
  };
}

export interface ValidationConfig {
  /** Naming convention rules */
  naming?: {
    pattern?: RegExp;
    componentPattern?: RegExp;
  };
  /** Required properties by token type */
  required?: Record<string, string[]>;
}

export interface TransformConfig {
  /** Color transformation options */
  color?: {
    formats?: string[];
  };
  /** Dimension transformation options */
  dimension?: {
    baseUnit?: string;
    units?: string[];
  };
}

export interface FlexibleTokenSystemConfig {
  /** Tier configuration */
  tiers: TierConfig[];

  /** Category configuration */
  categories: CategoryConfig[];

  /** Type definitions */
  types: Record<string, TypeConfig>;

  /** Sorting configurations */
  sortOrders: Record<string, string[]>;

  /** Path parsing utilities */
  paths: PathConfig;

  /** Theme configuration */
  themes: string[];
  defaultTheme?: string;

  /** Display configuration */
  display: DisplayConfig;

  /** File patterns and outputs */
  files: FileConfig;

  /** Validation rules */
  validation: ValidationConfig;

  /** Transform options */
  transforms: TransformConfig;
}
