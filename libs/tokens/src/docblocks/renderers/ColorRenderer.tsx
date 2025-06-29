import type { ReactNode } from 'react';
import { ColorGrid } from '../components/color/ColorGrid';
import { ColorSwatch } from '../components/color/ColorSwatch';
import styles from '../styles/ColorScale.module.css';
import {
  getColorBackgroundStyle,
  getColorDisplayName,
  tokenInfoToColorToken,
} from '../tools/colorUtils';
import type { TokenDisplayConfig } from '../types/config';
import type { TokenInfo } from '../types/tokenReferenceTable';
import { BaseTokenRenderer } from './BaseRenderer';

/**
 * Renderer for color tokens
 */
export class ColorRenderer extends BaseTokenRenderer {
  id = 'color';
  name = 'Color';
  tokenTypes = ['color'];

  /**
   * Check if this renderer can handle a token
   */
  canRender(token: TokenInfo): boolean {
    // Check type
    if (token.type === 'color') return true;

    // Check if path contains 'color'
    if (token.path?.includes('color')) return true;

    // Check if value looks like a color
    const value = String(token.value);
    return /^(#|rgb|rgba|hsl|hsla)/.test(value) || /^var\(--.*color.*\)/.test(value);
  }

  /**
   * Render color preview
   */
  renderPreview(token: TokenInfo): ReactNode {
    const colorToken = {
      name: token.name,
      value: String(token.value),
      usage: token.usage,
      path: token.path,
      themeValues: token.themeValues,
    };

    return (
      <ColorSwatch value={colorToken.value} background={getColorBackgroundStyle(colorToken)} />
    );
  }

  /**
   * Override collection rendering to use ColorGrid
   */
  renderCollection(tokens: TokenInfo[], config?: TokenDisplayConfig): ReactNode {
    const { grouping, sorting, filters } = config || {};

    // Apply filters
    let filteredTokens = tokens;
    if (filters?.include) {
      filteredTokens = filteredTokens.filter(filters.include);
    }
    if (filters?.exclude) {
      filteredTokens = filteredTokens.filter((token) => !filters.exclude!(token));
    }

    // Apply sorting
    if (sorting?.enabled && sorting?.sortBy) {
      filteredTokens = [...filteredTokens].sort(sorting.sortBy);
    }

    // Convert to ColorToken format
    const colorTokens = filteredTokens.map((token) => tokenInfoToColorToken(token));

    // Apply grouping
    if (grouping?.enabled && grouping?.groupBy) {
      const groups = new Map<string, typeof colorTokens>();

      filteredTokens.forEach((token, index) => {
        const group = grouping.groupBy(token);
        if (!groups.has(group)) {
          groups.set(group, []);
        }
        const colorToken = colorTokens[index];
        if (colorToken) {
          groups.get(group)!.push(colorToken);
        }
      });

      // Sort groups if order is provided
      const sortedGroups = grouping.groupOrder
        ? Array.from(groups.entries()).sort(([a], [b]) => {
            const orderA = grouping.groupOrder!.indexOf(a);
            const orderB = grouping.groupOrder!.indexOf(b);
            if (orderA === -1) return 1;
            if (orderB === -1) return -1;
            return orderA - orderB;
          })
        : Array.from(groups.entries());

      return (
        <div className={styles.colorScale}>
          {sortedGroups.map(([groupName, groupTokens]) => (
            <div key={groupName} style={{ marginBottom: 'var(--sys-spacing-lg)' }}>
              <h3 className={styles.colorGroupTitle}>{this.formatGroupName(groupName, config)}</h3>
              <ColorGrid
                tokens={groupTokens}
                gridColumns="small"
                getBackgroundStyle={getColorBackgroundStyle}
                getDisplayName={getColorDisplayName}
              />
            </div>
          ))}
        </div>
      );
    }

    // No grouping - render flat grid
    return (
      <div className={styles.colorScale}>
        <ColorGrid
          tokens={colorTokens}
          gridColumns="small"
          getBackgroundStyle={getColorBackgroundStyle}
          getDisplayName={getColorDisplayName}
        />
      </div>
    );
  }

  /**
   * Default configuration for color rendering
   */
  defaultConfig: TokenDisplayConfig = {
    grouping: {
      enabled: true,
      groupBy: (token) => {
        // Extract category from path like "sys.color.action.primary"
        const parts = token.path?.split('.') || [];
        if (parts.length >= 3 && parts[1] === 'color') {
          return parts[2] || 'other'; // 'action', 'surface', 'text', etc.
        }
        return 'other';
      },
      groupOrder: [
        'action',
        'surface',
        'text',
        'border',
        'icon',
        'status',
        'state',
        'interaction',
        'other',
      ],
    },
    sorting: {
      enabled: true,
      sortBy: (a, b) => {
        // Sort by shade number if present
        const aMatch = a.name.match(/(\d+)$/);
        const bMatch = b.name.match(/(\d+)$/);

        if (aMatch && bMatch) {
          return Number(aMatch[1]) - Number(bMatch[1]);
        }

        // Otherwise sort alphabetically
        return a.name.localeCompare(b.name);
      },
    },
  };
}

/**
 * Factory function to create a color renderer
 */
export function createColorRenderer(config?: Partial<TokenDisplayConfig>): ColorRenderer {
  const renderer = new ColorRenderer();
  if (config) {
    renderer.defaultConfig = {
      ...renderer.defaultConfig,
      ...config,
    };
  }
  return renderer;
}
