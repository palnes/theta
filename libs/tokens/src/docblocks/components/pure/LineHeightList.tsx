import React from 'react';
import styles from '../../styles/Typography.module.css';
import type { LineHeightToken } from '../../types/tokens';
import { TypographyPreview } from './TypographyPreview';

export interface LineHeightListProps {
  lineHeights: LineHeightToken[];
}

/**
 * Pure component for displaying line heights
 */
export const LineHeightList: React.FC<LineHeightListProps> = ({ lineHeights }) => {
  return (
    <ul className={styles.lineHeightList}>
      {lineHeights.map(({ name, key, description, cssVariable, jsPath, jsFlat }) => (
        <li key={key}>
          <TypographyPreview
            preview={
              <>
                <strong>{name}</strong>
                <br />
                This text has {name} line height.
                <br />
                {description}.
              </>
            }
            style={{ lineHeight: `var(${cssVariable})` }}
            cssVariable={cssVariable}
            jsPath={jsPath}
            jsFlat={jsFlat}
          />
        </li>
      ))}
    </ul>
  );
};
