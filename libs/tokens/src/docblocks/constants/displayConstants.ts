/**
 * Shared constants for display components
 */

// Dimension scale constants
export const DIMENSION_SCALE = {
  defaultMax: 128,
  axisOffset: 20,
} as const;

// Z-Index visualization constants
export const Z_INDEX_COLORS = [
  'hsl(0, 60%, 50%)',
  'hsl(72, 60%, 50%)',
  'hsl(144, 60%, 50%)',
  'hsl(216, 60%, 50%)',
  'hsl(288, 60%, 50%)',
  'hsl(360, 60%, 50%)',
] as const;

export const Z_INDEX_POSITIONS = [0, 40, 80, 120, 160, 200] as const;
export const Z_INDEX_SIZES = [160, 150, 140, 130, 120, 110] as const;

// Spacing filter
export const SPACING_KEYS = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
export const VISUAL_SPACING_KEYS = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

// Spacing display constraints
export const SPACING_MAX_WIDTH = {
  '3xl': 200,
  default: 'none',
} as const;

// Color display constants
export const COLOR_DISPLAY = {
  transparentGradient: {
    angle: '45deg',
    size1: '10px',
    size2: '20px',
  },
  gridSizes: {
    small: 120,
    large: 200,
  },
  popover: {
    minWidth: 280,
    maxWidth: 500,
    arrowSize: 8,
    closeButtonSize: 20,
  },
} as const;

// Common messages
export const LOADING_MESSAGES = {
  borders: 'Loading borders...',
  dimensions: 'Loading dimensions...',
  radius: 'Loading radius values...',
  shadows: 'Loading shadows...',
  spacing: 'Loading spacing...',
  typography: 'Loading typography...',
  fontSizes: 'Loading font sizes...',
  zIndex: 'Loading z-index values...',
} as const;

export const ERROR_MESSAGES = {
  borders: 'Error loading borders',
  dimensions: 'Error loading dimensions',
  radius: 'Error loading radius',
  shadows: 'Error loading shadows',
  spacing: 'Error loading spacing',
  typography: 'Error loading typography',
  fontSizes: 'Error loading font sizes',
  zIndex: 'Error loading z-index',
} as const;
