import type { FlexibleTokenSystemConfig } from '../types/FlexibleTokenSystemConfig';

/**
 * Default configuration for the token system
 * Provides sensible defaults that work for most design systems
 */
export const defaultTokenSystemConfig: FlexibleTokenSystemConfig = {
  // Common tier patterns following industry standards
  tiers: [
    {
      id: 'ref',
      name: 'Reference',
      description: 'Primitive design tokens - raw values like colors and dimensions',
    },
    {
      id: 'sys',
      name: 'System',
      description: 'Semantic design tokens - meaningful aliases with context',
    },
    {
      id: 'cmp',
      name: 'Component',
      description: 'Component-specific design tokens',
    },
  ],

  // Standard token categories covering common use cases
  categories: [
    { id: 'color', name: 'Color', icon: '🎨' },
    { id: 'typography', name: 'Typography', icon: '📝' },
    { id: 'spacing', name: 'Spacing', icon: '📏' },
    { id: 'dimension', name: 'Dimension', icon: '📐' },
    { id: 'shadow', name: 'Shadow', icon: '🌑' },
    { id: 'border', name: 'Border', icon: '🔲' },
    { id: 'radius', name: 'Radius', icon: '⭕' },
    { id: 'zIndex', name: 'Z-Index', icon: '📚' },
    { id: 'opacity', name: 'Opacity', icon: '👻' },
    { id: 'animation', name: 'Animation', icon: '🎬' },
  ],

  // Type definitions with common behaviors
  types: {
    // Composite types that expand into multiple properties
    typography: {
      composite: true,
      properties: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'],
      category: 'typography',
    },

    // Non-expandable object types
    shadow: {
      composite: false,
      category: 'shadow',
    },
    border: {
      composite: false,
      category: 'border',
    },
    gradient: {
      composite: false,
      category: 'color',
    },

    // Simple value types
    color: {
      composite: false,
      category: 'color',
      formats: ['hex', 'rgb', 'hsl'],
    },
    dimension: {
      composite: false,
      category: 'dimension',
      units: ['px', 'rem', 'em', '%', 'vw', 'vh'],
    },
    fontFamily: {
      composite: false,
      category: 'typography',
      array: true,
    },
    fontWeight: {
      composite: false,
      category: 'typography',
      values: {
        thin: 100,
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        black: 900,
      },
    },
  },

  // Common sorting patterns using t-shirt sizing and logical progressions
  sortOrders: {
    // Spacing follows common t-shirt sizing with extended ranges
    spacing: ['none', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],

    // Radius from sharp to round
    radius: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],

    // Font sizes following typographic scale
    fontSize: ['2xs', 'xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],

    // Font weights from thin to black
    fontWeight: ['thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'black'],

    // Line heights from tight to loose
    lineHeight: ['tight', 'snug', 'normal', 'relaxed', 'loose'],

    // Common breakpoints
    breakpoint: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],

    // Z-index layers
    zIndex: ['base', 'dropdown', 'sticky', 'modal', 'popover', 'tooltip', 'notification'],
  },

  // Path parsing with sensible defaults
  paths: {
    // Standard pattern: tier.category[.subcategory][.variant][.state]
    pattern: /^([^.]+)\.([^.]+)(?:\.(.+))?$/,

    // Separator for path segments
    separator: '.',

    // Extract tier (first segment)
    getTier: (path: string) => {
      const parts = path.split('.');
      return parts[0] || null;
    },

    // Extract category (second segment)
    getCategory: (path: string) => {
      const parts = path.split('.');
      return parts[1] || null;
    },

    // Extract subcategory (third segment if it exists and isn't a final value)
    getSubcategory: (path: string) => {
      const parts = path.split('.');
      if (parts.length >= 4) {
        return parts[2] || null;
      }
      return null;
    },

    // Extract token name (last segment)
    getName: (path: string) => {
      const parts = path.split('.');
      return parts[parts.length - 1] || '';
    },

    // Component detection (tokens starting with component tier)
    isComponent: (path: string) => path.startsWith('cmp.'),

    // Extract component name from path
    getComponent: (path: string) => {
      if (path.startsWith('cmp.')) {
        const parts = path.split('.');
        return parts[1] || null;
      }
      return null;
    },

    // Check if path represents a reference token
    isReference: (path: string) => path.startsWith('ref.'),

    // Check if path represents a semantic token
    isSemantic: (path: string) => path.startsWith('sys.'),
  },

  // Theme configuration
  themes: ['light', 'dark'],
  defaultTheme: 'light',

  // Display options for UI components
  display: {
    // How to group tokens in the UI
    groupBy: {
      color: 'subcategory', // Group by primary, secondary, status, etc.
      typography: 'property', // Group by fontSize, fontWeight, etc.
      spacing: 'none', // Show as flat list
      dimension: 'none',
      shadow: 'none',
      border: 'subcategory',
      radius: 'none',
    },

    // How to sort groups
    groupOrder: {
      color: ['primary', 'secondary', 'neutral', 'status', 'state', 'surface', 'text', 'border'],
      typography: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'],
    },

    // Token preview options
    preview: {
      color: 'swatch',
      typography: 'text',
      spacing: 'box',
      shadow: 'box',
      radius: 'box',
      border: 'box',
    },

    // Component-specific configurations
    components: {
      spacing: {
        visualDisplayKeys: ['xs', 'sm', 'md', 'lg', 'xl'],
        keyLabels: {
          none: 'None',
          '2xs': '2XS',
          xs: 'XS',
          sm: 'SM',
          md: 'MD',
          lg: 'LG',
          xl: 'XL',
          '2xl': '2XL',
          '3xl': '3XL',
          '14': '14',
          '18': '18',
        },
      },
      typography: {
        fontWeightLabels: {
          '100': 'Thin',
          '200': 'Extra Light',
          '300': 'Light',
          '400': 'Regular',
          '500': 'Medium',
          '600': 'Semi Bold',
          '700': 'Bold',
          '800': 'Extra Bold',
          '900': 'Black',
        },
      },
    },
  },

  // File organization patterns
  files: {
    // Where to find token files
    sources: ['src/tokens/**/*.json'],

    // Output configuration
    outputs: {
      css: {
        buildPath: 'dist/css/',
        files: {
          base: 'base.css',
          components: 'components/',
          themes: 'themes/',
        },
      },
      js: {
        buildPath: 'dist/',
        filename: 'tokens.js',
      },
      json: {
        buildPath: 'dist/',
        filename: 'tokens.json',
      },
    },
  },

  // Validation rules
  validation: {
    // Enforce naming conventions
    naming: {
      // Token names should be lowercase with hyphens
      pattern: /^[a-z0-9-]+$/,
      // Component names should be PascalCase
      componentPattern: /^[A-Z][a-zA-Z0-9]+$/,
    },

    // Required properties for different token types
    required: {
      color: ['$value'],
      typography: ['$value'],
      spacing: ['$value'],
      shadow: ['$value'],
    },
  },

  // Transform options
  transforms: {
    // Automatically transform colors to different formats
    color: {
      formats: ['hex', 'rgb', 'hsl'],
    },

    // Convert dimensions to different units
    dimension: {
      baseUnit: 'px',
      units: ['px', 'rem', 'em'],
    },
  },
};

/**
 * Merge user configuration with defaults
 */
export function mergeWithDefaults(
  userConfig: Partial<FlexibleTokenSystemConfig> = {}
): FlexibleTokenSystemConfig {
  return {
    ...defaultTokenSystemConfig,
    ...userConfig,

    // Deep merge nested objects
    types: {
      ...defaultTokenSystemConfig.types,
      ...userConfig.types,
    },
    sortOrders: {
      ...defaultTokenSystemConfig.sortOrders,
      ...userConfig.sortOrders,
    },
    paths: {
      ...defaultTokenSystemConfig.paths,
      ...userConfig.paths,
    },
    display: {
      ...defaultTokenSystemConfig.display,
      ...userConfig.display,
      groupBy: {
        ...defaultTokenSystemConfig.display.groupBy,
        ...userConfig.display?.groupBy,
      },
      groupOrder: {
        ...defaultTokenSystemConfig.display.groupOrder,
        ...userConfig.display?.groupOrder,
      },
      preview: {
        ...defaultTokenSystemConfig.display.preview,
        ...userConfig.display?.preview,
      },
    },
    files: {
      ...defaultTokenSystemConfig.files,
      ...userConfig.files,
      outputs: {
        ...defaultTokenSystemConfig.files.outputs,
        ...userConfig.files?.outputs,
      },
    },
    validation: {
      ...defaultTokenSystemConfig.validation,
      ...userConfig.validation,
      naming: {
        ...defaultTokenSystemConfig.validation.naming,
        ...userConfig.validation?.naming,
      },
      required: {
        ...defaultTokenSystemConfig.validation.required,
        ...userConfig.validation?.required,
      },
    },
    transforms: {
      ...defaultTokenSystemConfig.transforms,
      ...userConfig.transforms,
      color: {
        ...defaultTokenSystemConfig.transforms.color,
        ...userConfig.transforms?.color,
      },
      dimension: {
        ...defaultTokenSystemConfig.transforms.dimension,
        ...userConfig.transforms?.dimension,
      },
    },
  };
}
