import React from 'react';
import styles from '../../styles/Typography.module.css';
import type { FontSizeToken } from '../../types/tokens';
import { TypographyPreview } from './TypographyPreview';

export interface FontSizeListProps {
  fontSizes: FontSizeToken[];
  sampleText?: string;
}

/**
 * Pure component for displaying font sizes
 */
export const FontSizeList: React.FC<FontSizeListProps> = ({
  fontSizes,
  sampleText = 'The quick brown fox jumps over the lazy dog',
}) => {
  return (
    <ul className={styles.fontSizeList}>
      {fontSizes.map(({ key, cssVariable, jsPath, jsFlat }) => (
        <li key={key}>
          <TypographyPreview
            preview={sampleText}
            style={{ fontSize: `var(${cssVariable})` }}
            cssVariable={cssVariable}
            jsPath={jsPath}
            jsFlat={jsFlat}
          />
        </li>
      ))}
    </ul>
  );
};
