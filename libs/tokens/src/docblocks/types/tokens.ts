/**
 * Common token usage information
 */
export interface TokenUsage {
  label: string;
  value: string;
}

/**
 * Token with numeric value (dimensions, spacing, etc.)
 */
export interface NumericToken {
  key: string;
  value: number;
  tokenValue: string;
  usage?: TokenUsage[];
}

/**
 * Token with string value
 */
export interface StringToken {
  key: string;
  value: string;
  tokenValue: string;
  usage?: TokenUsage[];
}

/**
 * Color token with shade information
 */
export interface ColorShadeToken {
  shade: string;
  value: string;
  usage?: TokenUsage[];
}

/**
 * Color scale with multiple shades
 */
export interface ColorScale {
  name: string;
  colors: ColorShadeToken[];
}

/**
 * Special color token (white, black, transparent)
 */
export interface SpecialColorToken {
  name: string;
  token: {
    $value: string;
  };
  usage?: TokenUsage[];
}

/**
 * Font size token
 */
export interface FontSizeToken {
  size: number;
  value: string;
  key: string;
  usage?: TokenUsage[];
}

/**
 * Font weight token
 */
export interface FontWeightToken {
  name: string;
  value: number;
  token: {
    $value: string;
  };
  usage?: TokenUsage[];
}

/**
 * Line height token
 */
export interface LineHeightToken {
  name: string;
  key: string;
  description: string;
  token: {
    $value: string;
  };
  usage?: TokenUsage[];
}

/**
 * Font family token
 */
export interface FontFamilyToken {
  key: string;
  value: string | string[];
  usage?: TokenUsage[];
}

/**
 * Border token
 */
export interface BorderToken {
  key: string;
  value: string;
  description?: string;
  usage?: TokenUsage[];
}

/**
 * Grouped border tokens
 */
export interface BorderTokenGroup {
  width: BorderToken[];
  style: BorderToken[];
}

/**
 * Shadow value type
 */
export type ShadowValue =
  | string
  | {
      boxShadow: string;
      [key: string]: unknown;
    };

/**
 * Shadow token
 */
export interface ShadowToken {
  key: string;
  token: {
    $value: ShadowValue;
  };
  value: ShadowValue;
  usage?: TokenUsage[];
}

/**
 * Color token with metadata
 */
export interface ColorToken {
  $type: 'color';
  $value: string;
  usage?: TokenUsage[];
}

/**
 * Semantic color category
 */
export interface SemanticColorCategory {
  name: string;
  label: string;
  colors: Record<string, ColorToken | Record<string, ColorToken>>;
}

/**
 * Component button variant
 */
export interface ButtonVariant {
  variant: string;
  tokens: Record<string, any>;
}

/**
 * Component button tokens for a specific variant
 */
export interface ButtonVariantTokens {
  background?: string;
  backgroundHover?: string;
  text?: string;
  textHover?: string;
  border?: string;
  borderHover?: string;
}

/**
 * Component button size tokens
 */
export interface ButtonSizeTokens {
  height?: string;
  paddingX?: string;
  radius?: string;
  fontSize?: string;
  gap?: string;
}

/**
 * Generic token type for list displays
 */
export interface GenericToken {
  key: string;
  value: any;
  tokenValue?: string;
  usage?: TokenUsage[];
  [key: string]: any;
}

/**
 * Documentation data structure
 */
export interface DocumentationData {
  ref?: Record<string, any>;
  sys?: Record<string, any>;
  cmp?: Record<string, any>;
  $themes?: Record<string, any>;
}

/**
 * Token value types
 */
export type TokenValue = string | number | boolean | ShadowValue | { [key: string]: any };
