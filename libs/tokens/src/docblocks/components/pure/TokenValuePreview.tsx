import React from 'react';
import styles from '../../styles/ThemeComparison.module.css';
import type { TokenValue } from '../../types/tokens';

export interface TokenValuePreviewProps {
  value: TokenValue;
  type: string;
  showLabel?: boolean;
}

/**
 * Pure component for previewing token values based on their type
 */
export const TokenValuePreview: React.FC<TokenValuePreviewProps> = ({
  value,
  type,
  showLabel = false,
}) => {
  // Format the value for display
  const formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

  switch (type) {
    case 'color':
      return (
        <div className={styles.colorPreview}>
          <div
            className={styles.colorSwatch}
            style={{ backgroundColor: formattedValue }}
            title={formattedValue}
          />
          {showLabel && <span className={styles.colorValue}>{formattedValue}</span>}
        </div>
      );

    case 'dimension':
    case 'spacing':
      return (
        <div className={styles.dimensionPreview}>
          <div
            className={styles.dimensionBar}
            style={{ width: formattedValue }}
            title={formattedValue}
          />
          {showLabel && <span className={styles.dimensionValue}>{formattedValue}</span>}
        </div>
      );

    case 'shadow':
      return (
        <div className={styles.shadowPreview}>
          <div
            className={styles.shadowBox}
            style={{ boxShadow: formattedValue }}
            title={formattedValue}
          />
          {showLabel && <span className={styles.shadowValue}>{formattedValue}</span>}
        </div>
      );

    case 'radius':
      return (
        <div className={styles.radiusPreview}>
          <div
            className={styles.radiusBox}
            style={{ borderRadius: formattedValue }}
            title={formattedValue}
          />
          {showLabel && <span className={styles.radiusValue}>{formattedValue}</span>}
        </div>
      );

    case 'typography':
      if (typeof value === 'object' && value.fontSize) {
        return (
          <div
            className={styles.typographyPreview}
            style={{
              fontSize: value.fontSize,
              fontWeight: value.fontWeight,
              lineHeight: value.lineHeight,
              fontFamily: value.fontFamily,
            }}
          >
            Aa
          </div>
        );
      }
      return <span className={styles.textValue}>{formattedValue}</span>;

    default:
      return <span className={styles.textValue}>{formattedValue}</span>;
  }
};
