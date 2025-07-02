import type React from 'react';
import styles from '../../styles/DimensionScale.module.css';
import type { NumericToken } from '../../types/tokens';

export interface DimensionBarProps {
  dimension: NumericToken;
  maxNegative: number;
  maxPositive: number;
  axisOffset?: number;
}

/**
 * Pure component for rendering a single dimension bar visualization
 */
export const DimensionBar: React.FC<DimensionBarProps> = ({
  dimension,
  maxNegative,
  maxPositive,
  axisOffset = 20,
}) => {
  const { value, tokenValue } = dimension;
  const isNegative = value < 0;
  const barWidth = Math.min(Math.abs(value), isNegative ? maxNegative : maxPositive);
  const barLeft = isNegative ? maxNegative - Math.abs(value) : maxNegative;

  return (
    <div className={styles.dimensionItem}>
      <div className={styles.dimensionLabel}>{value}</div>
      <div
        className={styles.dimensionVisual}
        style={{ width: maxNegative + maxPositive + axisOffset }}
      >
        {/* Zero axis line */}
        <div className={styles.zeroLine} style={{ left: maxNegative }} />
        {/* Bar */}
        <div
          className={`${styles.dimensionBar} ${isNegative ? styles.dimensionBarNegative : styles.dimensionBarPositive}`}
          style={{
            width: barWidth,
            left: barLeft,
          }}
        />
      </div>
      <div className={styles.dimensionInfo}>
        <span className={styles.dimensionValue}>{tokenValue}</span>
      </div>
    </div>
  );
};
