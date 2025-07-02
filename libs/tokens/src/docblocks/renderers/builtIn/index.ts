import { tokenRendererRegistry } from '../TokenRenderer';
import { colorRendererDefinition } from './ColorRenderer';
import { shadowRendererDefinition } from './ShadowRenderer';
import { spacingRendererDefinition } from './SpacingRenderer';
import { typographyRendererDefinition } from './TypographyRenderer';

/**
 * Register all built-in renderers
 */
export function registerBuiltInRenderers() {
  tokenRendererRegistry.register(colorRendererDefinition);
  tokenRendererRegistry.register(spacingRendererDefinition);
  tokenRendererRegistry.register(shadowRendererDefinition);
  tokenRendererRegistry.register(typographyRendererDefinition);
}

// Auto-register on import
registerBuiltInRenderers();

// Export individual renderers for customization
export * from './ColorRenderer';
export * from './ShadowRenderer';
export * from './SpacingRenderer';
export * from './TypographyRenderer';
