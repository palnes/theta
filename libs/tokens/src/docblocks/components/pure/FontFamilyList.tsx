import React from 'react';
import styles from '../../styles/Typography.module.css';
import { formatFontFamilyValue } from '../../tools/tokenHelpers';
import type { FontFamilyToken } from '../../types/tokens';
import { TypographyPreview } from './TypographyPreview';

export interface FontFamilyListProps {
  fontFamilies: FontFamilyToken[];
}

/**
 * Pure component for displaying font families
 */
export const FontFamilyList: React.FC<FontFamilyListProps> = ({ fontFamilies }) => {
  return (
    <ul className={styles.fontFamilyList}>
      {fontFamilies.map(({ key, value, cssVariable, jsPath, jsFlat }) => {
        const fontValue = formatFontFamilyValue(value);
        const sampleText =
          key === 'mono'
            ? 'function example() { return "Hello, World!"; }'
            : 'The quick brown fox jumps over the lazy dog';

        return (
          <li key={key}>
            <TypographyPreview
              preview={sampleText}
              style={{ fontFamily: `var(${cssVariable})` }}
              cssVariable={cssVariable}
              jsPath={jsPath}
              jsFlat={jsFlat}
              additionalInfo={<div className={styles.fontStack}>{fontValue}</div>}
            />
          </li>
        );
      })}
    </ul>
  );
};
