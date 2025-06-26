import React from 'react';
import { VISUAL_SPACING_KEYS } from '../constants/displayConstants';
import { useSpacingTokens } from '../hooks/useTokens';
import styles from '../styles/SpacingScale.module.css';
import type { GenericToken } from '../types/tokens';

/**
 * Visual representation of spacing tokens
 * Shows spacing as boxes with padding
 */
export const SpacingVisual: React.FC = () => {
  const { data, loading, error } = useSpacingTokens(true);

  if (loading) return <div>Loading spacing visuals...</div>;
  if (error) return <div>Error loading spacing: {error}</div>;

  // When visualOnly is true, data contains processed tokens from getSemanticSpacing
  const processedTokens = data as GenericToken[] | null;
  if (!processedTokens || processedTokens.length === 0) return <div>No spacing tokens found</div>;

  const visualTokens = processedTokens.filter(({ key }) =>
    VISUAL_SPACING_KEYS.includes(key as (typeof VISUAL_SPACING_KEYS)[number])
  );

  return (
    <ul className={styles.visualGrid}>
      {visualTokens.map(({ key, value, tokenValue }) => {
        const spacingValue = value || tokenValue || '0';
        return (
          <li key={key} className={styles.visualItem}>
            <figure className={styles.visualBox}>
              <div
                className={styles.visualInner}
                style={{
                  width: `calc(100% - ${spacingValue} * 2)`,
                  height: `calc(100% - ${spacingValue} * 2)`,
                }}
              />
            </figure>
            <figcaption className={styles.visualLabel}>{key?.toUpperCase() || ''}</figcaption>
          </li>
        );
      })}
    </ul>
  );
};
