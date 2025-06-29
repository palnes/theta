import React from 'react';
import { TokenInfo } from '../types/tokenReferenceTable';

/**
 * Base interface for token renderers
 */
export interface TokenRendererProps {
  token: TokenInfo;
  className?: string;
  showDetails?: boolean;
}

/**
 * Token renderer registry
 */
export interface TokenRendererDefinition {
  /** Unique identifier for the renderer */
  id: string;
  /** Display name */
  name: string;
  /** Token types this renderer can handle */
  types: string[];
  /** Optional test function to determine if renderer applies */
  test?: (token: TokenInfo) => boolean;
  /** The renderer component */
  component: React.ComponentType<TokenRendererProps>;
}

/**
 * Registry for custom token renderers
 */
class TokenRendererRegistry {
  private renderers: Map<string, TokenRendererDefinition> = new Map();

  /**
   * Register a custom renderer
   */
  register(renderer: TokenRendererDefinition) {
    this.renderers.set(renderer.id, renderer);
  }

  /**
   * Unregister a renderer
   */
  unregister(id: string) {
    this.renderers.delete(id);
  }

  /**
   * Get a renderer by ID
   */
  getById(id: string): TokenRendererDefinition | undefined {
    return this.renderers.get(id);
  }

  /**
   * Find the best renderer for a token
   */
  findRenderer(token: TokenInfo): TokenRendererDefinition | undefined {
    // First, check if token has explicit renderer
    const tokenRenderer = token.type && this.getByType(token.type);
    if (tokenRenderer) return tokenRenderer;

    // Then, check test functions
    for (const renderer of this.renderers.values()) {
      if (renderer.test?.(token)) {
        return renderer;
      }
    }

    return undefined;
  }

  /**
   * Get renderer by token type
   */
  getByType(type: string): TokenRendererDefinition | undefined {
    for (const renderer of this.renderers.values()) {
      if (renderer.types.includes(type)) {
        return renderer;
      }
    }
    return undefined;
  }

  /**
   * Get all registered renderers
   */
  getAll(): TokenRendererDefinition[] {
    return Array.from(this.renderers.values());
  }
}

// Global renderer registry
export const tokenRendererRegistry = new TokenRendererRegistry();

/**
 * Hook to access the renderer registry
 */
export const useTokenRenderer = (token: TokenInfo) => {
  const renderer = tokenRendererRegistry.findRenderer(token);
  return renderer;
};

/**
 * Default fallback renderer
 */
export const DefaultTokenRenderer: React.FC<TokenRendererProps> = ({ token }) => {
  return (
    <div>
      <strong>{token.name}</strong>
      <pre>{JSON.stringify(token.value, null, 2)}</pre>
    </div>
  );
};

/**
 * Token renderer component that automatically selects the right renderer
 */
export const TokenRenderer: React.FC<TokenRendererProps> = (props) => {
  const renderer = useTokenRenderer(props.token);

  if (renderer) {
    const Component = renderer.component;
    return <Component {...props} />;
  }

  return <DefaultTokenRenderer {...props} />;
};
