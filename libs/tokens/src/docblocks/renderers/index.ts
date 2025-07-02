// Export all renderers
export * from './BaseRenderer';
export * from './builtIn';
export * from './ColorRenderer';
export * from './GenericRenderer';
export * from './RendererRegistry';
export * from './SpacingRenderer';

// Export new renderer system
export * from './TokenRenderer';
export * from './TypographyRenderer';

// Import renderers for registration
import { ColorRenderer } from './ColorRenderer';
import { GenericRenderer } from './GenericRenderer';
import { globalRendererRegistry } from './RendererRegistry';
import { SpacingRenderer } from './SpacingRenderer';
import { TypographyRenderer } from './TypographyRenderer';

/**
 * Register default renderers
 * This is called automatically when the module is imported
 */
export function registerDefaultRenderers() {
  globalRendererRegistry.register(new ColorRenderer());
  globalRendererRegistry.register(new TypographyRenderer());
  globalRendererRegistry.register(new SpacingRenderer());
  globalRendererRegistry.register(new GenericRenderer());
}

// Auto-register on import
registerDefaultRenderers();

// Also register new built-in renderers
import './builtIn';
