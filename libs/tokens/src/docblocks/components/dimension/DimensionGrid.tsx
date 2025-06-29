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
          {showTokenInfo && dimension.usage && (
            <div className={styles.tokenInfo}>
              {dimension.usage.map((u, index) => (
                <React.Fragment key={u.label}>
                  {index > 0 && <span className={styles.dimensionSeparator}>•</span>}
                  <code>{u.value}</code>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
