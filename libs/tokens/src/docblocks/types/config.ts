import type { ReactNode } from 'react';
import type { TokenInfo } from './tokenReferenceTable';

/**
 * Configuration for displaying tokens in a generic way
 */
export interface TokenDisplayConfig {
  /**
   * Define token categories and their display properties
   */
  categories?: {
    [key: string]: {
      label: string;
      description?: string;
      icon?: string;
      order?: number;
    };
  };

  /**
   * Define how to extract display values from tokens
   */
  valueExtractors?: {
    [tokenType: string]: (token: TokenInfo) => any;
  };

  /**
   * Define how to group tokens
   */
  grouping?: {
    enabled: boolean;
    groupBy: (token: TokenInfo) => string;
    groupOrder?: string[];
  };

  /**
   * Define display formats for different token types
   */
  displayFormats?: {
    [tokenType: string]: {
      preview: (value: any, token: TokenInfo) => ReactNode;
      examples?: (value: any, token: TokenInfo) => ReactNode[];
    };
  };

  /**
   * Token filtering rules
   */
  filters?: {
    include?: (token: TokenInfo) => boolean;
    exclude?: (token: TokenInfo) => boolean;
  };

  /**
   * Sorting configuration
   */
  sorting?: {
    enabled: boolean;
    sortBy: (a: TokenInfo, b: TokenInfo) => number;
  };
}

/**
 * Plugin interface for custom token renderers
 */
export interface TokenRenderer {
  /**
   * Unique identifier for this renderer
   */
  id: string;

  /**
   * Display name for this renderer
   */
  name: string;

  /**
   * Token types this renderer can handle
   */
  tokenTypes: string[];

  /**
   * Check if this renderer can handle a specific token
   */
  canRender: (token: TokenInfo) => boolean;

  /**
   * Render a single token
   */
  renderToken: (token: TokenInfo, config?: TokenDisplayConfig) => ReactNode;

  /**
   * Render a collection of tokens
   */
  renderCollection?: (tokens: TokenInfo[], config?: TokenDisplayConfig) => ReactNode;

  /**
   * Preview component for the token value
   */
  renderPreview?: (token: TokenInfo) => ReactNode;

  /**
   * Default configuration for this renderer
   */
  defaultConfig?: TokenDisplayConfig;
}

/**
 * Registry for token renderers
 */
export interface TokenRendererRegistry {
  register: (renderer: TokenRenderer) => void;
  unregister: (id: string) => void;
  get: (id: string) => TokenRenderer | undefined;
  getForToken: (token: TokenInfo) => TokenRenderer | undefined;
  getAll: () => TokenRenderer[];
}
