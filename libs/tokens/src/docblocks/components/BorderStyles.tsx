import React from 'react';
import { useBorderTokens } from '../hooks/useTokens';
import styles from '../styles/BorderDisplay.module.css';
import sharedStyles from '../styles/shared.module.css';
import type { BorderToken } from '../types/tokens';
import { TokenFormatDisplay } from './TokenFormatDisplay';

/**
 * Display border style tokens
 * Focused component for border styles only
 */
interface BorderTokenGroup {
  width?: BorderToken[];
  style?: BorderToken[];
}

export const BorderStyles: React.FC = () => {
  const { data, loading, error } = useBorderTokens();

  if (loading) return <div>Loading border styles...</div>;
  if (error) return <div>Error loading borders: {error}</div>;
  if (!data) return <div>No border data available</div>;

  const borderData = data as BorderTokenGroup;
  const styleTokens = borderData.style || [];

  return (
    <ul className={styles.styleGrid}>
      {styleTokens.map(({ key, description, cssVariable, jsPath, jsFlat, value }) => {
        const borderStyle =
          key === 'none'
            ? 'none'
            : `var(--sys-border-width-medium) ${value} var(--sys-color-border-default)`;

        return (
          <li key={key} style={{ listStyle: 'none' }}>
            <article className={styles.styleCard} style={{ border: borderStyle }}>
              <h4 className={sharedStyles.componentTitle}>{key}</h4>
              <TokenFormatDisplay
                formats={{
                  css: cssVariable || `--sys-border-style-${key}`,
                  json: jsPath,
                  js: jsFlat || jsPath,
                }}
              />
              {description && <p className={sharedStyles.description}>{description}</p>}
            </article>
          </li>
        );
      })}
    </ul>
  );
};
