import type { ReactNode } from 'react';
import { TokenCard } from '../components/common/TokenCard';
import { TokenGrid } from '../components/common/TokenGrid';
import type { TokenDisplayConfig, TokenRenderer } from '../types/config';
import type { TokenInfo } from '../types/tokenReferenceTable';

/**
 * Base class for token renderers
 * Provides common functionality that specific renderers can override
 */
export abstract class BaseTokenRenderer implements TokenRenderer {
  abstract id: string;
  abstract name: string;
  abstract tokenTypes: string[];

  /**
   * Default implementation checks if token type matches
   */
  canRender(token: TokenInfo): boolean {
    return this.tokenTypes.includes(token.type || '');
  }

  /**
   * Default token rendering using TokenCard
   */
  renderToken(token: TokenInfo): ReactNode {
    const preview = this.renderPreview?.(token);

    return <TokenCard key={token.name} title={token.name} usage={token.usage} preview={preview} />;
  }

  /**
   * Default collection rendering using TokenGrid
   */
  renderCollection(tokens: TokenInfo[], config?: TokenDisplayConfig): ReactNode {
    const { grouping, sorting, filters } = config || {};

    // Apply filters
    let filteredTokens = tokens;
    if (filters?.include) {
      filteredTokens = filteredTokens.filter(filters.include);
    }
    if (filters?.exclude) {
      filteredTokens = filteredTokens.filter((token) => !filters.exclude?.(token));
    }

    // Apply sorting
    if (sorting?.enabled && sorting?.sortBy) {
      filteredTokens = [...filteredTokens].sort(sorting.sortBy);
    }

    // Apply grouping
    if (grouping?.enabled && grouping?.groupBy) {
      const groups = new Map<string, TokenInfo[]>();

      for (const token of filteredTokens) {
        const group = grouping.groupBy(token);
        if (!groups.has(group)) {
          groups.set(group, []);
        }
        groups.get(group)?.push(token);
      }

      // Sort groups if order is provided
      const sortedGroups = grouping.groupOrder
        ? Array.from(groups.entries()).sort(([a], [b]) => {
            const orderA = grouping.groupOrder?.indexOf(a) ?? -1;
            const orderB = grouping.groupOrder?.indexOf(b) ?? -1;
            if (orderA === -1) return 1;
            if (orderB === -1) return -1;
            return orderA - orderB;
          })
        : Array.from(groups.entries());

      return (
        <>
          {sortedGroups.map(([groupName, groupTokens]) => (
            <div key={groupName}>
              <h3>{this.formatGroupName(groupName, config)}</h3>
              <TokenGrid>{groupTokens.map((token) => this.renderToken(token))}</TokenGrid>
            </div>
          ))}
        </>
      );
    }

    // No grouping - render flat grid
    return <TokenGrid>{filteredTokens.map((token) => this.renderToken(token))}</TokenGrid>;
  }

  /**
   * Format group name - can be overridden by specific renderers
   */
  protected formatGroupName(groupName: string, config?: TokenDisplayConfig): string {
    const category = config?.categories?.[groupName];
    return category?.label || groupName.charAt(0).toUpperCase() + groupName.slice(1);
  }

  /**
   * Abstract method that must be implemented by specific renderers
   */
  abstract renderPreview?(token: TokenInfo): ReactNode;

  /**
   * Default config can be overridden by specific renderers
   */
  defaultConfig?: TokenDisplayConfig;
}
