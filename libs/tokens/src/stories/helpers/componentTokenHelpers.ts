import componentButtons from '../../tokens/component/button.json';

export const getButtonVariants = () => {
  const variants = ['primary', 'secondary', 'ghost'];

  return variants.map((variant) => {
    const variantTokens = (componentButtons.cmp.button.color as any)[variant] || {};
    return {
      variant,
      tokens: variantTokens,
    };
  });
};

export const getButtonSizes = () => {
  // Get actual sizes from the button height tokens
  const heightKeys = Object.keys(componentButtons.cmp.button.height || {});

  // Return the sizes in the order we want them displayed
  const orderedSizes = ['small', 'medium', 'large'];
  return orderedSizes.filter((size) => heightKeys.includes(size));
};

export const getButtonTokensForVariant = (variant: string) => {
  const variantTokens = (componentButtons.cmp.button.color as any)[variant] || {};

  return {
    background: variantTokens.background?.$value,
    backgroundHover: variantTokens.backgroundHover?.$value,
    text: variantTokens.text?.$value,
    textHover: variantTokens.textHover?.$value,
    border: variantTokens.border?.$value,
    borderHover: variantTokens.borderHover?.$value,
  };
};

export const getButtonSizeTokens = (size: string) => {
  const button = componentButtons.cmp.button as any;

  return {
    height: button.height?.[size]?.$value,
    paddingX: button.paddingX?.[size]?.$value,
    radius: button.radius?.[size]?.$value,
    fontSize: button.fontSize?.[size]?.$value,
    gap: button.gap?.[size]?.$value,
  };
};
