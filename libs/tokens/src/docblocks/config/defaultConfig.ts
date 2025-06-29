import type { TokenDisplayConfig } from '../types/config';

/**
 * Default configuration for the design system
 * This can be overridden by consumers to adapt to their token structure
 */
export const defaultTokenConfig: TokenDisplayConfig = {
  categories: {
    // Color categories
    action: { label: 'Action', order: 1 },
    surface: { label: 'Surface', order: 2 },
    text: { label: 'Text', order: 3 },
    border: { label: 'Border', order: 4 },
    icon: { label: 'Icon', order: 5 },
    status: { label: 'Status', order: 6 },
    state: { label: 'State', order: 7 },
    interaction: { label: 'Interaction', order: 8 },

    // Typography categories
    heading: { label: 'Heading', order: 1 },
    body: { label: 'Body', order: 2 },
    label: { label: 'Label', order: 3 },

    // Component categories
    button: { label: 'Button', order: 1 },
    input: { label: 'Input', order: 2 },
    card: { label: 'Card', order: 3 },
    badge: { label: 'Badge', order: 4 },
    switch: { label: 'Switch', order: 5 },
    checkbox: { label: 'Checkbox', order: 6 },
    radioButton: { label: 'Radio Button', order: 7 },
  },
};

/**
 * Spacing configuration
 */
export const spacingConfig = {
  orderedKeys: ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '14', '18'],
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
};

/**
 * Typography configuration
 */
export const typographyConfig = {
  fontSizeOrder: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'],
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
  lineHeightOrder: ['none', 'tight', 'normal', 'relaxed', 'loose'],
};

/**
 * Border configuration
 */
export const borderConfig = {
  widthOrder: ['thin', 'medium', 'thick', 'heavy'],
  styleOrder: ['solid', 'dashed', 'dotted', 'double', 'none'],
  widthExamples: {
    thin: { label: 'Thin (1px)', cssVar: 'var(--sys-border-width-thin)' },
    medium: { label: 'Medium (2px)', cssVar: 'var(--sys-border-width-medium)' },
    thick: { label: 'Thick (3px)', cssVar: 'var(--sys-border-width-thick)' },
    heavy: { label: 'Heavy (4px)', cssVar: 'var(--sys-border-width-heavy)' },
  },
};

/**
 * Z-index configuration
 */
export const zIndexConfig = {
  visualizationOrder: ['base', 'dropdown', 'sticky', 'modal', 'popover', 'tooltip'],
  examples: {
    base: { icon: '📄', label: 'Base Content' },
    dropdown: { icon: '📋', label: 'Dropdowns' },
    sticky: { icon: '📌', label: 'Sticky Elements' },
    modal: { icon: '🪟', label: 'Modals' },
    popover: { icon: '💬', label: 'Popovers' },
    tooltip: { icon: '💡', label: 'Tooltips' },
  },
};

/**
 * Shadow configuration
 */
export const shadowConfig = {
  extractValue: (token: any) => {
    if (typeof token.value === 'string') return token.value;
    if (token.value?.boxShadow) return token.value.boxShadow;
    if (token.usage?.[0]?.value) return token.usage[0].value;
    return '';
  },
};

/**
 * Color configuration
 */
export const colorConfig = {
  statusColors: ['info', 'success', 'warning', 'error', 'brand'],
  groupByCategory: true,
  showThemeVariations: true,
};
