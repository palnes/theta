import React from 'react';
import styles from '../../styles/Typography.module.css';
import type { FontWeightToken } from '../../types/tokens';
import { TypographyPreview } from './TypographyPreview';

export interface FontWeightListProps {
  fontWeights: FontWeightToken[];
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
    <ul className={styles.fontWeightList}>
      {fontWeights.map(({ name, value, cssVariable, jsPath, jsFlat }) => (
        <li key={value}>
          <TypographyPreview
            preview={`${name} (${value}) - ${sampleText}`}
            style={{ fontWeight: `var(${cssVariable})` }}
            cssVariable={cssVariable}
            jsPath={jsPath}
            jsFlat={jsFlat}
          />
        </li>
      ))}
    </ul>
  );
};
