import type React from 'react';
import { useSpacingTokens } from '../../hooks/useSpacingTokens';
import styles from '../../styles/SpacingScale.module.css';

/**
 * Visual representation of spacing tokens
 * Shows spacing as boxes with padding
 */
export const SpacingVisual: React.FC = () => {
  const { tokens, loading, error } = useSpacingTokens(true);

  if (loading) return <div>Loading spacing visuals...</div>;
  if (error) return <div>Error loading spacing: {error}</div>;
  if (!tokens || tokens.length === 0) return <div>No spacing tokens found</div>;

  // Filter visual tokens - already filtered by useSpacingTokens when visualOnly=true
  const visualTokens = tokens.map((token) => ({
    key: token.name,
    value: token.value,
    tokenValue: token.value,
  }));

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
