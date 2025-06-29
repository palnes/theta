import type { ReactNode } from 'react';
import { typographyConfig } from '../config/defaultConfig';
import styles from '../styles/shared.module.css';
import type { TokenDisplayConfig } from '../types/config';
import type { TokenInfo } from '../types/tokenReferenceTable';
import { BaseTokenRenderer } from './BaseRenderer';

/**
 * Renderer for typography tokens
 */
export class TypographyRenderer extends BaseTokenRenderer {
  id = 'typography';
  name = 'Typography';
  tokenTypes = ['typography', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight'];

  /**
   * Check if this renderer can handle a token
   */
  canRender(token: TokenInfo): boolean {
    // Check type
    if (this.tokenTypes.includes(token.type || '')) return true;

    // Check if path contains typography-related terms
    const path = token.path || '';
    return /\.(typography|font|line)/.test(path);
  }

  /**
   * Render typography preview
   */
  renderPreview(token: TokenInfo): ReactNode {
    const value = token.value;

    // Handle composite typography tokens
    if (typeof value === 'object' && value !== null) {
      const { fontFamily, fontSize, fontWeight, lineHeight } = value as any;
      return (
        <div
          className={styles.typographyExample}
          style={{
            fontFamily,
            fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
            fontWeight,
            lineHeight: typeof lineHeight === 'number' ? lineHeight : undefined,
          }}
        >
          The quick brown fox
        </div>
      );
    }

    // Handle individual typography properties
    const type = token.type || this.detectTypographyType(token);

    switch (type) {
      case 'fontSize':
        return (
          <div
            className={styles.typographyExample}
            style={{ fontSize: typeof value === 'number' ? `${value}px` : value }}
          >
            {value}px
          </div>
        );

      case 'fontWeight': {
        const weightLabel =
          typographyConfig.fontWeightLabels[
            String(value) as keyof typeof typographyConfig.fontWeightLabels
          ] || String(value);
        return (
          <div className={styles.typographyExample} style={{ fontWeight: value }}>
            {weightLabel} ({value})
          </div>
        );
      }

      case 'lineHeight':
        return (
          <div className={styles.typographyExample}>
            <div style={{ lineHeight: value }}>
              Line height: {value}
              <br />
              Multiple lines
              <br />
              To show spacing
            </div>
          </div>
        );

      case 'fontFamily':
        return (
          <div
            className={styles.typographyExample}
            style={{ fontFamily: Array.isArray(value) ? value[0] : value }}
          >
            {Array.isArray(value) ? value[0] : value}
          </div>
        );

      default:
        return <div>{String(value)}</div>;
    }
  }

  /**
   * Detect typography type from token name/path
   */
  private detectTypographyType(token: TokenInfo): string {
    const nameLower = token.name.toLowerCase();
    const pathLower = (token.path || '').toLowerCase();

    if (nameLower.includes('size') || pathLower.includes('size')) return 'fontSize';
    if (nameLower.includes('weight') || pathLower.includes('weight')) return 'fontWeight';
    if (nameLower.includes('line') || pathLower.includes('line')) return 'lineHeight';
    if (nameLower.includes('family') || pathLower.includes('family')) return 'fontFamily';

    return 'typography';
  }

  /**
   * Default configuration for typography rendering
   */
  defaultConfig: TokenDisplayConfig = {
    grouping: {
      enabled: true,
      groupBy: (token) => {
        // Group by typography type
        const type = token.type || new TypographyRenderer().detectTypographyType(token);
        return type;
      },
      groupOrder: ['typography', 'fontSize', 'fontWeight', 'lineHeight', 'fontFamily'],
    },
    sorting: {
      enabled: true,
      sortBy: (a, b) => {
        const renderer = new TypographyRenderer();
        const typeA = a.type || renderer.detectTypographyType(a);
        const typeB = b.type || renderer.detectTypographyType(b);

        // Sort font sizes numerically
        if (typeA === 'fontSize' && typeB === 'fontSize') {
          const sizeA = typeof a.value === 'number' ? a.value : Number.parseInt(String(a.value));
          const sizeB = typeof b.value === 'number' ? b.value : Number.parseInt(String(b.value));
          return sizeA - sizeB;
        }

        // Sort font weights numerically
        if (typeA === 'fontWeight' && typeB === 'fontWeight') {
          return Number(a.value) - Number(b.value);
        }

        // Use configured order for other types
        const orderMap: Record<string, string[]> = {
          fontSize: typographyConfig.fontSizeOrder,
          lineHeight: typographyConfig.lineHeightOrder,
        };

        const order = orderMap[typeA];
        if (order && typeA === typeB) {
          const indexA = order.indexOf(renderer.extractKey(a.name));
          const indexB = order.indexOf(renderer.extractKey(b.name));
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
        }

        return a.name.localeCompare(b.name);
      },
    },
  };

  /**
   * Extract key from token name (e.g., "fontSize16" -> "16")
   */
  private extractKey(name: string): string {
    const match = name.match(/[a-zA-Z]+(\w+)$/);
    return match?.[1] || name;
  }
}

/**
 * Factory function to create a typography renderer
 */
export function createTypographyRenderer(config?: Partial<TokenDisplayConfig>): TypographyRenderer {
  const renderer = new TypographyRenderer();
  if (config) {
    renderer.defaultConfig = {
      ...renderer.defaultConfig,
      ...config,
    };
  }
  return renderer;
}
