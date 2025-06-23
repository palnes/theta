import componentButtons from '../../tokens/component/button.json';
import type { ButtonComponentTokens } from './types/buttonJson';
import type { ButtonSizeTokens, ButtonVariant, ButtonVariantTokens } from './types/tokens';

const typedButtons = componentButtons as ButtonComponentTokens;

/**
 * Get available button variants with their tokens
 */
export const getButtonVariants = (): ButtonVariant[] => {
  const variants = ['primary', 'secondary', 'ghost'];

  return variants.map((variant) => {
    const variantTokens = typedButtons.cmp.button.color?.[variant] || {};
    return {
      variant,
      tokens: variantTokens,
    };
  });
};

/**
 * Get available button sizes in display order
 */
export const getButtonSizes = (): string[] => {
  // Get actual sizes from the button height tokens
  const heightKeys = Object.keys(typedButtons.cmp.button.height || {});

  // Return the sizes in the order we want them displayed
  const orderedSizes = ['small', 'medium', 'large'];
  return orderedSizes.filter((size) => heightKeys.includes(size));
};

/**
 * Get color tokens for a specific button variant
 */
export const getButtonTokensForVariant = (variant: string): ButtonVariantTokens => {
  const variantTokens = typedButtons.cmp.button.color?.[variant] || {};

  return {
    background: variantTokens.background?.default?.$value
      ? String(variantTokens.background.default.$value)
      : undefined,
    backgroundHover: variantTokens.background?.hover?.$value
      ? String(variantTokens.background.hover.$value)
      : undefined,
    text: variantTokens.text?.default?.$value
      ? String(variantTokens.text.default.$value)
      : undefined,
    textHover: (variantTokens.text as any)?.hover?.$value
      ? String((variantTokens.text as any).hover.$value)
      : variantTokens.text?.default?.$value
        ? String(variantTokens.text.default.$value)
        : undefined,
    border: variantTokens.border?.default?.$value
      ? String(variantTokens.border.default.$value)
      : undefined,
    borderHover: undefined,
  };
};

/**
 * Get size-related tokens for a button
 */
export const getButtonSizeTokens = (size: string): ButtonSizeTokens => {
  const button = typedButtons.cmp.button;
  const sizeKey = size as 'small' | 'medium' | 'large';

  return {
    height: button.height?.[sizeKey]?.$value ? String(button.height[sizeKey].$value) : undefined,
    paddingX: button.paddingX?.[sizeKey]?.$value
      ? String(button.paddingX[sizeKey].$value)
      : undefined,
    radius: button.radius?.[sizeKey]?.$value ? String(button.radius[sizeKey].$value) : undefined,
    fontSize: button.fontSize?.[sizeKey]?.$value
      ? String(button.fontSize[sizeKey].$value)
      : undefined,
    gap: button.gap?.[sizeKey]?.$value ? String(button.gap[sizeKey].$value) : undefined,
  };
};
