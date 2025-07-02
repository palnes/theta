import type { ReactNode } from 'react';
import React from 'react';
import { useTokens } from '../../hooks/useTokens';
import { useRendererRegistry } from '../../renderers/RendererRegistry';
import type { TokenDisplayConfig, TokenRenderer, TokenRendererRegistry } from '../../types/config';
import { ErrorState } from '../common/ErrorState';
import { LoadingState } from '../common/LoadingState';

interface TokenViewerProps {
  /**
   * Token tier (e.g., 'reference', 'semantic', 'component')
   */
  tier?: string;

  /**
   * Token category (e.g., 'color', 'typography', 'spacing')
   */
  category?: string;

  /**
   * Specific renderer to use (optional - will auto-detect if not provided)
   */
  renderer?: TokenRenderer;

  /**
   * Custom configuration (merged with renderer's default config)
   */
  config?: TokenDisplayConfig;

  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;

  /**
   * Custom error component
   */
  errorComponent?: (error: string) => ReactNode;

  /**
   * Custom empty state component
   */
  emptyComponent?: ReactNode;

  /**
   * Title to display above tokens
   */
  title?: string;

  /**
   * Whether to show the title
   */
  showTitle?: boolean;
}

/**
 * Generic token display component that uses the renderer system
 */
export const TokenViewer: React.FC<TokenViewerProps> = ({
  tier,
  category,
  renderer,
  config,
  loadingComponent,
  errorComponent,
  emptyComponent,
  title,
  showTitle = true,
}) => {
  const registry = useRendererRegistry();
  const { tokens, loading, error } = useTokens({
    tier: tier,
    category: category,
  });

  // Find the appropriate renderer - must be called unconditionally
  const activeRenderer = useActiveRenderer(renderer, tokens, registry);

  // Show loading state
  if (loading) {
    return <>{loadingComponent || <LoadingState />}</>;
  }

  // Show error state
  if (error) {
    return <>{errorComponent?.(error) || <ErrorState error={error} />}</>;
  }

  // No tokens
  if (!tokens || tokens.length === 0) {
    return <>{emptyComponent || <div>No tokens found</div>}</>;
  }

  // No renderer found
  if (!activeRenderer) {
    return <NoRendererError token={tokens[0]} registry={registry} />;
  }

  // Merge configurations
  const mergedConfig: TokenDisplayConfig = {
    ...activeRenderer.defaultConfig,
    ...config,
  };

  // Render the tokens
  return (
    <div>
      {showTitle && title && <h2>{title}</h2>}
      <TokenCollection renderer={activeRenderer} tokens={tokens} config={mergedConfig} />
    </div>
  );
};

// Helper hook to find the appropriate renderer
const useActiveRenderer = (
  providedRenderer: TokenRenderer | undefined,
  tokens: any[],
  registry: TokenRendererRegistry
): TokenRenderer | null => {
  if (providedRenderer) return providedRenderer;

  if (tokens.length > 0 && tokens[0]) {
    const tokenRenderer = registry.getForToken(tokens[0]);
    if (tokenRenderer) return tokenRenderer;
  }

  return registry.get('generic') || null;
};

// Component to display when no renderer is found
const NoRendererError: React.FC<{ token: any; registry: TokenRendererRegistry }> = ({
  token,
  registry,
}) => (
  <div>
    <p>No renderer found for tokens of type: {token?.type || 'unknown'}</p>
    <p>
      Available renderers:{' '}
      {registry
        .getAll()
        .map((r: TokenRenderer) => r.name)
        .join(', ')}
    </p>
  </div>
);

// Component to render token collection
const TokenCollection: React.FC<{
  renderer: TokenRenderer;
  tokens: any[];
  config: TokenDisplayConfig;
}> = ({ renderer, tokens, config }) => {
  if (renderer.renderCollection) {
    return <>{renderer.renderCollection(tokens, config)}</>;
  }

  return <div>{tokens.map((token: any) => renderer.renderToken(token, config))}</div>;
};

/**
 * Hook to create a configured token display
 */
export function useConfiguredTokenDisplay(
  defaultConfig?: TokenDisplayConfig,
  defaultRenderer?: TokenRenderer
) {
  return React.useCallback(
    (props: Omit<TokenViewerProps, 'config' | 'renderer'>) => (
      <TokenViewer {...props} config={defaultConfig} renderer={defaultRenderer} />
    ),
    [defaultConfig, defaultRenderer]
  );
}
