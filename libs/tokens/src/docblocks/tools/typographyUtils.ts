/**
 * Get the appropriate HTML element for a typography variant
 */
export function getTypographyElement(category: string, variant: string): string {
  if (category === 'heading') {
    if (variant === '3xl' || variant === '2xl') return 'h1';
    if (variant === 'xl' || variant === 'lg') return 'h2';
    if (variant === 'md') return 'h3';
    return 'h4';
  }

  if (category === 'body') return 'p';
  if (category === 'code') return 'pre';
  if (category === 'label') return 'span';

  return 'span';
}

/**
 * Get button size class for action variants
 */
export function getActionButtonClass(variant: string): string {
  switch (variant) {
    case 'lg':
      return 'actionButtonLg';
    case 'sm':
      return 'actionButtonSm';
    default:
      return 'actionButtonMd';
  }
}

/**
 * Format variant name for display
 */
export function formatVariantName(variant: string): string {
  return variant.toUpperCase();
}

/**
 * Check if category needs special rendering
 */
export function isSpecialCategory(category: string): boolean {
  return ['action', 'label', 'code'].includes(category);
}
