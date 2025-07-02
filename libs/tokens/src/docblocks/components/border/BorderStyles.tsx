import type React from 'react';
import { useTokens } from '../../hooks/useTokens';
import styles from '../../styles/BorderDisplay.module.css';
import sharedStyles from '../../styles/shared.module.css';
import { TokenFormats } from '../token-display/TokenFormats';

/**
 * Display border style tokens
 * Focused component for border styles only
 */
export const BorderStyles: React.FC = () => {
  // Get border style tokens directly
  const {
    tokens: styleTokens,
    loading,
    error,
  } = useTokens({
    tier: 'sys',
    category: 'border',
    filter: (token) => token.path.includes('.style.'),
  });

  if (loading) return <div>Loading border styles...</div>;
  if (error) return <div>Error loading borders: {error}</div>;
  if (!styleTokens || styleTokens.length === 0) return <div>No border style tokens available</div>;

  return (
    <ul className={styles.styleGrid}>
      {styleTokens.map((token) => {
        const { name: key, description, value, usage } = token;
        const borderStyle =
          key === 'none'
            ? 'none'
            : `var(--sys-border-width-medium) ${value} var(--sys-color-border-default)`;

        return (
          <li key={token.path} style={{ listStyle: 'none' }}>
            <article className={styles.styleCard} style={{ border: borderStyle }}>
              <h4 className={sharedStyles.componentTitle}>{key}</h4>
              <TokenFormats usage={usage} />
              {description && <p className={sharedStyles.description}>{description}</p>}
            </article>
          </li>
        );
      })}
    </ul>
  );
};
