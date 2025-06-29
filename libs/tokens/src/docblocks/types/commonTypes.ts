/**
 * Token usage information
 */
export interface TokenUsage {
  label: string;
  value: string;
}

/**
 * Base token interface for all token types
 */
export interface BaseToken {
  usage?: TokenUsage[];
  path?: string;
  name?: string;
  description?: string;
}

/**
 * Token with a value
 */
export interface ValueToken<T = any> extends BaseToken {
  value: T;
  $value?: T; // For raw token format
  $type?: string;
}

/**
 * Token that can be themed
 */
export interface ThemeableToken<T = any> extends ValueToken<T> {
  themeValues?: Record<string, T>;
  isThemeable?: boolean;
  overriddenIn?: string[];
}

/**
 * Common hook return type
 */
export interface TokenHookResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Component variant types
 */
export type DisplayVariant = 'default' | 'compact' | 'expanded';
export type GridSize = 'small' | 'medium' | 'large';
