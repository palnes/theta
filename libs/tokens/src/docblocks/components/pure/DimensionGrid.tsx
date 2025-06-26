import React from 'react';
import styles from '../../styles/DimensionScale.module.css';
import type { NumericToken } from '../../types/tokens';
import { DimensionBar } from './DimensionBar';

export interface DimensionGridProps {
  dimensions: NumericToken[];
  maxNegative: number;
  maxPositive: number;
  axisOffset?: number;
  showTokenInfo?: boolean;
}

/**
 * Pure component for rendering a grid of dimension visualizations
 */
export const DimensionGrid: React.FC<DimensionGridProps> = ({
  dimensions,
  maxNegative,
  maxPositive,
  axisOffset = 20,
  showTokenInfo = false,
}) => {
  return (
    <div className={styles.dimensionScale}>
      {dimensions.map((dimension) => (
        <div key={dimension.key}>
          <DimensionBar
            dimension={dimension}
            maxNegative={maxNegative}
            maxPositive={maxPositive}
            axisOffset={axisOffset}
          />
          {showTokenInfo && (
            <div className={styles.tokenInfo}>
              <code>{dimension.jsFlat || dimension.jsPath}</code>
              <span className={styles.dimensionSeparator}>•</span>
              <code>{dimension.cssVariable}</code>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
