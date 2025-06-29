import React from 'react';
import styles from '../../styles/Typography.module.css';
import type { TokenInfo } from '../../types/tokenReferenceTable';
import { TokenFormats } from '../token-display/TokenFormats';

export interface LineHeightListProps {
  lineHeights: TokenInfo[];
}

/**
 * Pure component for displaying line heights
 */
export const LineHeightList: React.FC<LineHeightListProps> = ({ lineHeights }) => {
  return (
    <div className={styles.typographyTable}>
      {lineHeights.map((token) => {
        const value = token.value;

        return (
          <div key={token.path} className={styles.typographyRow}>
            <div className={styles.typographyExample}>
              <div style={{ lineHeight: value, fontSize: '16px' }}>
                Line one
                <br />
                Line two
                <br />
                Line three
              </div>
            </div>
            <div className={styles.typographyInfo}>
              <div className={styles.typographyMeta}>
                <h3 className={styles.tokenName}>{token.name}</h3>
                <span className={styles.tokenDetail}>{value}</span>
              </div>
              <div className={styles.tokenUsage}>
                <TokenFormats usage={token.usage} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
