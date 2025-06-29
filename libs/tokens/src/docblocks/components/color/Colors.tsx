import React from 'react';
import { useTokens } from '../../hooks/useTokens';
import styles from '../../styles/ColorScale.module.css';
import {
  type ColorToken,
  getColorBackgroundStyle,
  getColorDisplayName,
  groupColorTokens,
  tokenInfoToColorToken,
} from '../../tools/colorUtils';
import { TokenInfo } from '../../types/tokenReferenceTable';
import { ColorGrid } from './ColorGrid';

interface ColorsProps {
  title: string;
  tokens?: ColorToken[];
  filter?: (token: any) => boolean;
  gridColumns?: 'small' | 'large';
  groupBy?: 'category' | 'none';
}

/**
 * Container component for displaying color tokens
 * Handles data processing and delegates rendering to pure components
 */
export const Colors: React.FC<ColorsProps> = ({
  title,
  tokens: providedTokens,
  filter,
  gridColumns = 'small',
  groupBy = 'none',
}) => {
  // Only call useTokens when filter is provided
  const shouldFetch = !!filter && !providedTokens;
  const {
    tokens: fetchedTokens,
    loading,
    error,
  } = useTokens(
    shouldFetch
      ? {
          tier: 'sys',
          category: 'color',
          filter,
        }
      : {}
  );

  const rawTokens = providedTokens || (shouldFetch ? fetchedTokens : []) || [];

  // Handle loading and error states when using filter
  if (shouldFetch) {
    if (loading) return <div>Loading {title.toLowerCase()}...</div>;
    if (error) return <div>Error loading colors: {error}</div>;
    if (rawTokens.length === 0) return <div>No {title.toLowerCase()} found</div>;
  }

  // Convert tokens to ColorToken format if they're TokenInfo
  const tokens: ColorToken[] = rawTokens.map((token) =>
    'usage' in token ? tokenInfoToColorToken(token as TokenInfo) : (token as ColorToken)
  );

  // Use utility to group tokens
  const groupedTokens = groupColorTokens(tokens, groupBy);

  return (
    <div className={styles.colorScale}>
      <h2 className={styles.colorScaleTitle}>{title}</h2>
      {groupBy === 'none' ? (
        <ColorGrid
          tokens={tokens}
          gridColumns={gridColumns}
          getBackgroundStyle={getColorBackgroundStyle}
          getDisplayName={getColorDisplayName}
        />
      ) : (
        Object.entries(groupedTokens).map(([group, groupTokens]) => (
          <div key={group} style={{ marginBottom: 'var(--sys-spacing-2xl)' }}>
            {group !== 'ungrouped' && (
              <h3 className={styles.colorGroupTitle}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </h3>
            )}
            <ColorGrid
              tokens={groupTokens}
              gridColumns={gridColumns}
              getBackgroundStyle={getColorBackgroundStyle}
              getDisplayName={getColorDisplayName}
            />
          </div>
        ))
      )}
    </div>
  );
};
