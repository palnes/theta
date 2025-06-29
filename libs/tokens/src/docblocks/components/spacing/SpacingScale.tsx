import React from 'react';
import { SPACING_KEYS, SPACING_MAX_WIDTH } from '../../constants/displayConstants';
import { useSpacingTokens } from '../../hooks/useSpacingTokens';
import styles from '../../styles/SpacingScale.module.css';
import { SelectableCode } from '../common/SelectableCode';

/**
 * Display spacing scale as horizontal bars
 * Focused component for the main spacing visualization
 */
export const SpacingScale: React.FC = () => {
  const { tokens, loading, error } = useSpacingTokens(false);

  if (loading) return <div>Loading spacing scale...</div>;
  if (error) return <div>Error loading spacing: {error}</div>;
  if (!tokens || tokens.length === 0) return <div>No spacing tokens found</div>;

  // Extract the key from the token path (e.g., "sys.spacing.md" -> "md")
  const spacingTokens = tokens
    .map((token) => ({
      ...token,
      key: token.path.split('.').pop() || '',
      tokenValue: token.value,
    }))
    .filter(({ key }) => SPACING_KEYS.includes(key as (typeof SPACING_KEYS)[number]));

  return (
    <ul className={styles.spacingList}>
      {spacingTokens.map((token) => {
        const { key, tokenValue, value, usage } = token;

        return (
          <li key={key} className={styles.spacingItem}>
            <span className={styles.spacingLabel}>{key?.toUpperCase() || ''}</span>
            <div
              className={styles.spacingBar}
              style={{
                width: value || tokenValue,
                maxWidth:
                  SPACING_MAX_WIDTH[key as keyof typeof SPACING_MAX_WIDTH] ||
                  SPACING_MAX_WIDTH.default,
              }}
            />
            <div className={styles.spacingInfo}>
              <span className={styles.spacingValue}>{tokenValue}</span>
              {usage.map((u) => (
                <React.Fragment key={u.label}>
                  <span className={styles.spacingSeparator}>•</span>
                  <SelectableCode className={styles.spacingCode}>{u.value}</SelectableCode>
                </React.Fragment>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
