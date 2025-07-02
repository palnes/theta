import type React from 'react';
import styles from '../../styles/Typography.module.css';
import type { TokenInfo } from '../../types/tokenReferenceTable';
import { TokenFormats } from '../token-display/TokenFormats';

export interface FontWeightListProps {
  fontWeights: TokenInfo[];
  sampleText?: string;
}

/**
 * Pure component for displaying font weights
 */
export const FontWeightList: React.FC<FontWeightListProps> = ({
  fontWeights,
  sampleText = 'The quick brown fox jumps over the lazy dog',
}) => {
  return (
    <div className={styles.typographyTable}>
      {fontWeights.map((token) => {
        const value = token.value;

        return (
          <div key={token.path} className={styles.typographyRow}>
            <div className={styles.typographyExample}>
              <div style={{ fontWeight: value, fontSize: '16px', lineHeight: 1.4 }}>
                {sampleText}
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
