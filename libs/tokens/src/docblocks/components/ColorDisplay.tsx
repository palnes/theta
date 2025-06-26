import React from 'react';
import styles from '../styles/ColorScale.module.css';
import {
  type ColorToken,
  getColorBackgroundStyle,
  getColorDisplayName,
  groupColorTokens,
} from '../tools/colorUtils';
import { ColorGrid } from './pure/ColorGrid';

interface ColorDisplayProps {
  title: string;
  tokens: ColorToken[];
  gridColumns?: 'small' | 'large';
  groupBy?: 'category' | 'none';
}

/**
 * Container component for displaying color tokens
 * Handles data processing and delegates rendering to pure components
 */
export const ColorDisplay: React.FC<ColorDisplayProps> = ({
  title,
  tokens,
  gridColumns = 'small',
  groupBy = 'none',
}) => {
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
