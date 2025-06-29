import React from 'react';
import type { ReactNode } from 'react';
import { defaultTokenConfig } from '../../config/defaultConfig';
import { useTokens } from '../../hooks/useTokens';
import { useRendererRegistry } from '../../renderers/RendererRegistry';
import type { TokenDisplayConfig, TokenRenderer } from '../../types/config';
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

  // Find appropriate renderer
  let activeRenderer = renderer;
  if (!activeRenderer && tokens.length > 0 && tokens[0]) {
    // Try to find a renderer that can handle the first token
    activeRenderer = registry.getForToken(tokens[0]);
  }

  if (!activeRenderer) {
    // Use generic renderer as fallback
    const genericRenderer = registry.get('generic');
    if (genericRenderer) {
      activeRenderer = genericRenderer;
    } else {
      return (
        <div>
          <p>No renderer found for tokens of type: {tokens[0]?.type || 'unknown'}</p>
          <p>
            Available renderers:{' '}
            {registry
              .getAll()
              .map((r) => r.name)
              .join(', ')}
          </p>
        </div>
      );
    }
  }

  // Merge configurations
  const mergedConfig: TokenDisplayConfig = {
    ...defaultTokenConfig,
    ...activeRenderer.defaultConfig,
    ...config,
  };

  // Render the tokens
  return (
    <div>
      {showTitle && title && <h2>{title}</h2>}
      {activeRenderer.renderCollection ? (
        activeRenderer.renderCollection(tokens, mergedConfig)
      ) : (
        <div>{tokens.map((token: any) => activeRenderer.renderToken(token, mergedConfig))}</div>
      )}
    </div>
  );
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
