import type { ReactNode } from 'react';
import styles from '../styles/shared.module.css';

// Spacing configuration
const spacingConfig = {
  orderedKeys: ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '14', '18'],
  visualDisplayKeys: ['xs', 'sm', 'md', 'lg', 'xl'],
  keyLabels: {
    none: 'None',
    '2xs': '2XS',
    xs: 'XS',
    sm: 'SM',
    md: 'MD',
    lg: 'LG',
    xl: 'XL',
    '2xl': '2XL',
    '3xl': '3XL',
    '14': '14',
    '18': '18',
  },
};

import type { TokenDisplayConfig } from '../types/config';
import type { TokenInfo } from '../types/tokenReferenceTable';
import { BaseTokenRenderer } from './BaseRenderer';

/**
 * Renderer for spacing tokens
 */
export class SpacingRenderer extends BaseTokenRenderer {
  id = 'spacing';
  name = 'Spacing';
  tokenTypes = ['spacing', 'space', 'gap', 'padding', 'margin'];

  /**
   * Check if this renderer can handle a token
   */
  canRender(token: TokenInfo): boolean {
    // Check type
    if (this.tokenTypes.includes(token.type || '')) return true;

    // Check if path contains spacing-related terms
    const path = token.path || '';
    const name = token.name.toLowerCase();
    return (
      /\.(spacing|space|gap|padding|margin)/.test(path) ||
      /(spacing|space|gap|padding|margin)/.test(name)
    );
  }

  /**
   * Render spacing preview
   */
  renderPreview(token: TokenInfo): ReactNode {
    const value =
      typeof token.value === 'number' ? token.value : Number.parseInt(String(token.value));
    const displayValue = Number.isNaN(value) ? 0 : value;

    // Determine if this should be shown as a visual spacing
    const key = this.extractSpacingKey(token.name);
    const isVisual = spacingConfig.visualDisplayKeys.includes(key);

    if (isVisual && displayValue > 0) {
      return (
        <div className={styles.spacingVisual}>
          <div className={styles.spacingBar} style={{ width: `${displayValue}px` }}>
            <span className={styles.spacingLabel}>{displayValue}px</span>
          </div>
        </div>
      );
    }

    // For non-visual or zero spacing, just show the value
    return <div className={styles.spacingValue}>{displayValue}px</div>;
  }

  /**
   * Get spacing configuration
   */
  private getSpacingConfig() {
    // In a real implementation, this would come from context
    // For now, return defaults
    return {
      visualDisplayKeys: ['xs', 'sm', 'md', 'lg', 'xl'],
      keyLabels: {
        none: 'None',
        '2xs': '2XS',
        xs: 'XS',
        sm: 'SM',
        md: 'MD',
        lg: 'LG',
        xl: 'XL',
        '2xl': '2XL',
        '3xl': '3XL',
        '14': '14',
        '18': '18',
      },
    };
  }

  /**
   * Extract spacing key from token name
   */
  private extractSpacingKey(name: string): string {
    // Handle names like "spacingMd", "spacing-md", "spacing.md"
    const cleaned = name
      .toLowerCase()
      .replace(/^(sys|ref|cmp)\.?/, '') // Remove tier prefix
      .replace(/^spacing[\s.-]?/, ''); // Remove 'spacing' prefix

    // Map to standard keys
    const keyMap: Record<string, string> = {
      medium: 'md',
      small: 'sm',
      large: 'lg',
      extralarge: 'xl',
      extrasmall: 'xs',
    };

    return keyMap[cleaned] || cleaned;
  }

  /**
   * Override collection rendering for better spacing display
   */
  renderCollection(tokens: TokenInfo[], config?: TokenDisplayConfig): ReactNode {
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Apply filters and sorting from base class
    let processedTokens = tokens;
    if (mergedConfig.filters?.include) {
      processedTokens = processedTokens.filter(mergedConfig.filters.include);
    }
    if (mergedConfig.filters?.exclude) {
      processedTokens = processedTokens.filter((token) => !mergedConfig.filters?.exclude?.(token));
    }

    // Sort by configured order or by value
    processedTokens = [...processedTokens].sort((a, b) => {
      const keyA = this.extractSpacingKey(a.name);
      const keyB = this.extractSpacingKey(b.name);

      const orderedKeys = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '14', '18'];
      const orderA = orderedKeys.indexOf(keyA);
      const orderB = orderedKeys.indexOf(keyB);

      if (orderA !== -1 && orderB !== -1) {
        return orderA - orderB;
      }

      // Fall back to numeric comparison
      const valueA = typeof a.value === 'number' ? a.value : Number.parseInt(String(a.value));
      const valueB = typeof b.value === 'number' ? b.value : Number.parseInt(String(b.value));
      return valueA - valueB;
    });

    return (
      <div className={styles.spacingContainer}>
        {processedTokens.map((token) => (
          <div key={token.name} className={styles.spacingItem}>
            <div className={styles.spacingHeader}>
              <h4>{this.formatTokenName(token)}</h4>
              <code>{token.usage[0]?.value || token.value}</code>
            </div>
            {this.renderPreview(token)}
          </div>
        ))}
      </div>
    );
  }

  /**
   * Format token name for display
   */
  private formatTokenName(token: TokenInfo): string {
    const key = this.extractSpacingKey(token.name);
    const config = this.getSpacingConfig();
    return config.keyLabels[key as keyof typeof config.keyLabels] || key.toUpperCase();
  }

  /**
   * Default configuration for spacing rendering
   */
  defaultConfig: TokenDisplayConfig = {
    sorting: {
      enabled: true,
      sortBy: () => {
        // Already handled in renderCollection
        return 0;
      },
    },
  };
}

/**
 * Factory function to create a spacing renderer
 */
export function createSpacingRenderer(config?: Partial<TokenDisplayConfig>): SpacingRenderer {
  const renderer = new SpacingRenderer();
  if (config) {
    renderer.defaultConfig = {
      ...renderer.defaultConfig,
      ...config,
    };
  }
  return renderer;
}
