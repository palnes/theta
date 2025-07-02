import type React from 'react';
import styles from '../../styles/Typography.module.css';
import { formatFontFamilyValue } from '../../tools/tokenHelpers';
import type { TokenInfo } from '../../types/tokenReferenceTable';
import { TokenFormats } from '../token-display/TokenFormats';

export interface FontFamilyListProps {
  fontFamilies: TokenInfo[];
}

/**
 * Pure component for displaying font families
 */
export const FontFamilyList: React.FC<FontFamilyListProps> = ({ fontFamilies }) => {
  return (
    <div className={styles.typographyTable}>
      {fontFamilies.map((token) => {
        const fontValue = formatFontFamilyValue(token.value);
        const key = token.name.toLowerCase();
        const sampleText = key.includes('mono')
          ? 'function example() { return "Hello, World!"; }'
          : 'The quick brown fox jumps over the lazy dog';

        return (
          <div key={token.path} className={styles.typographyRow}>
            <div className={styles.typographyExample}>
              <div
                style={{
                  fontFamily: fontValue,
                  fontSize: '16px',
                  lineHeight: 1.4,
                }}
              >
                {sampleText}
              </div>
            </div>
            <div className={styles.typographyInfo}>
              <div className={styles.typographyMeta}>
                <h3 className={styles.tokenName}>{token.name}</h3>
                <span className={styles.tokenDetail}>{fontValue}</span>
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
