/**
 * Base token structure with common properties
 */
export interface BaseToken {
  cssVariable: string;
  jsPath: string;
  jsFlat?: string;
}

/**
 * Token with numeric value (dimensions, spacing, etc.)
 */
export interface NumericToken extends BaseToken {
  key: string;
  value: number;
  tokenValue: string;
}

/**
 * Token with string value
 */
export interface StringToken extends BaseToken {
  key: string;
  value: string;
  tokenValue: string;
}

/**
 * Color token with shade information
 */
export interface ColorShadeToken extends BaseToken {
  shade: string;
  value: string;
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
export interface SpecialColorToken extends BaseToken {
  name: string;
  token: {
    $value: string;
  };
}

/**
 * Font size token
 */
export interface FontSizeToken extends BaseToken {
  size: number;
  value: string;
  key: string;
}

/**
 * Font weight token
 */
export interface FontWeightToken extends BaseToken {
  name: string;
  value: number;
  token: {
    $value: string;
  };
}

/**
 * Line height token
 */
export interface LineHeightToken extends BaseToken {
  name: string;
  key: string;
  description: string;
  token: {
    $value: string;
  };
}

/**
 * Font family token
 */
export interface FontFamilyToken {
  key: string;
  value: string | string[];
  cssVariable: string;
  jsPath: string;
  jsFlat?: string;
}

/**
 * Border token
 */
export interface BorderToken extends BaseToken {
  key: string;
  value: string;
  description?: string;
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
export interface ShadowToken extends BaseToken {
  key: string;
  token: {
    $value: ShadowValue;
  };
  value: ShadowValue;
}

/**
 * Typography value type
 */
export interface TypographyValue {
  fontFamily?: string | string[];
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textTransform?: string;
  [key: string]: unknown;
}

/**
 * Typography variant token
 */
export interface TypographyVariantToken extends BaseToken {
  variant: string;
  value: TypographyValue;
}

/**
 * Typography category with variants
 */
export interface TypographyCategory {
  category: string;
  variants: TypographyVariantToken[];
}

/**
 * Color token with metadata
 */
export interface ColorToken {
  $type: 'color';
  $value: string;
  cssVariable: string;
  jsPath: string;
  jsFlat?: string;
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
export interface GenericToken extends BaseToken {
  key: string;
  value: any;
  tokenValue?: string;
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
export type TokenValue =
  | string
  | number
  | boolean
  | ShadowValue
  | TypographyValue
  | { [key: string]: any };
