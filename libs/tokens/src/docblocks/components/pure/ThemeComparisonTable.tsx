import React from 'react';
import type { ThemeComparisonToken } from '../../hooks/useThemeComparisonData';
import styles from '../../styles/ThemeComparison.module.css';
import { formatTokenValue, getTokenPreviewType } from '../../tools/tokenFormatting';
import { TokenValuePreview } from './TokenValuePreview';

export interface ThemeComparisonTableProps {
  tokens: ThemeComparisonToken[];
  themes: string[];
  onTokenClick?: (token: ThemeComparisonToken) => void;
}

/**
 * Pure component for displaying theme comparison table
 */
export const ThemeComparisonTable: React.FC<ThemeComparisonTableProps> = ({
  tokens,
  themes,
  onTokenClick,
}) => {
  if (tokens.length === 0) {
    return <div className={styles.emptyState}>No tokens match your search criteria.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.comparisonTable}>
        <thead>
          <tr>
            <th className={styles.tokenColumn}>Token</th>
            <th className={styles.valueColumn}>Base</th>
            {themes.map((theme) => (
              <th key={theme} className={styles.valueColumn}>
                {theme}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <ThemeComparisonRow
              key={token.path}
              token={token}
              themes={themes}
              onClick={onTokenClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ThemeComparisonRowProps {
  token: ThemeComparisonToken;
  themes: string[];
  onClick?: (token: ThemeComparisonToken) => void;
}

const ThemeComparisonRow: React.FC<ThemeComparisonRowProps> = ({ token, themes, onClick }) => {
  const previewType = getTokenPreviewType(token.type);
  const hasChanges = Object.values(token.themeValues).some(
    (value) => formatTokenValue(value) !== formatTokenValue(token.baseValue)
  );

  const handleClick = () => onClick?.(token);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <tr
      className={`${styles.tokenRow} ${hasChanges ? styles.hasChanges : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      <td className={styles.tokenCell}>
        <div className={styles.tokenPath}>{token.path}</div>
        <div className={styles.tokenMeta}>
          <span className={styles.tokenType}>{token.type || 'unknown'}</span>
          {token.isThemeable && <span className={styles.themeableBadge}>themeable</span>}
        </div>
      </td>

      <td className={styles.valueCell}>
        <TokenValuePreview value={token.baseValue} type={previewType} showLabel={true} />
      </td>

      {themes.map((theme) => {
        const themeValue = token.themeValues[theme];
        const difference = token.differences[theme];
        const isChanged =
          themeValue !== undefined &&
          formatTokenValue(themeValue) !== formatTokenValue(token.baseValue);

        return (
          <td key={theme} className={`${styles.valueCell} ${isChanged ? styles.changedValue : ''}`}>
            {themeValue !== undefined ? (
              <div className={styles.themeValue}>
                <TokenValuePreview value={themeValue} type={previewType} showLabel={true} />
                {difference && <div className={styles.difference}>{difference}</div>}
              </div>
            ) : (
              <span className={styles.inheritedValue}>inherited</span>
            )}
          </td>
        );
      })}
    </tr>
  );
};
