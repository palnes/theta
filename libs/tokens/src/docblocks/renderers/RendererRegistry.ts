import type { TokenRenderer, TokenRendererRegistry } from '../types/config';
import type { TokenInfo } from '../types/tokenReferenceTable';

/**
 * Registry for managing token renderers
 */
export class TokenRendererRegistryImpl implements TokenRendererRegistry {
  private renderers = new Map<string, TokenRenderer>();

  register(renderer: TokenRenderer): void {
    if (this.renderers.has(renderer.id)) {
      console.warn(`Renderer with id "${renderer.id}" already exists. Overwriting.`);
    }
    this.renderers.set(renderer.id, renderer);
  }

  unregister(id: string): void {
    this.renderers.delete(id);
  }

  get(id: string): TokenRenderer | undefined {
    return this.renderers.get(id);
  }

  getForToken(token: TokenInfo): TokenRenderer | undefined {
    for (const renderer of this.renderers.values()) {
      if (renderer.canRender(token)) {
        return renderer;
      }
    }
    return undefined;
  }

  getAll(): TokenRenderer[] {
    return Array.from(this.renderers.values());
  }

  /**
   * Get all renderers that can handle a specific token type
   */
  getForType(tokenType: string): TokenRenderer[] {
    return this.getAll().filter((renderer) => renderer.tokenTypes.includes(tokenType));
  }
}

// Global registry instance
export const globalRendererRegistry = new TokenRendererRegistryImpl();

/**
 * Hook to use the renderer registry
 */
export function useRendererRegistry(): TokenRendererRegistry {
  return globalRendererRegistry;
}
