import React from 'react';
import { DIMENSION_SCALE } from '../../constants/displayConstants';
import { useDimensionTokens } from '../../hooks/useDimensionTokens';
import styles from '../../styles/DimensionScale.module.css';
import { BaseTokenDisplay } from '../common/BaseTokenDisplay';
import { SelectableCode } from '../common/SelectableCode';
import { DimensionCard } from './DimensionCard';

export type DimensionsProps = Record<string, never>;

/**
 * Container component for dimension token display
 * Uses separated business logic and pure components
 */
export const Dimensions: React.FC<DimensionsProps> = () => {
  const { dimensions, maxNegative, maxPositive } = useDimensionTokens();

  return (
    <BaseTokenDisplay loadingKey="dimensions" errorKey="dimensions">
      {() => (
        <div className={styles.dimensionScale}>
          {dimensions.map(({ value, tokenValue, key, usage }) => (
            <div key={key} className={styles.dimensionItem}>
              <div className={styles.dimensionLabel}>{value}</div>
              <div
                className={styles.dimensionVisual}
                style={{ width: maxNegative + maxPositive + DIMENSION_SCALE.axisOffset }}
              >
                {/* Zero axis line */}
                <div className={styles.zeroLine} style={{ left: maxNegative }} />
                {/* Bar */}
                <div
                  className={`${styles.dimensionBar} ${value < 0 ? styles.dimensionBarNegative : styles.dimensionBarPositive}`}
                  style={{
                    width: Math.min(Math.abs(value), value < 0 ? maxNegative : maxPositive),
                    left: value < 0 ? maxNegative - Math.abs(value) : maxNegative,
                  }}
                />
              </div>
              <div className={styles.dimensionInfo}>
                <span className={styles.dimensionValue}>{tokenValue}</span>
                {usage?.map((u) => (
                  <React.Fragment key={u.label}>
                    <span className={styles.dimensionSeparator}>•</span>
                    <SelectableCode className={styles.dimensionCode}>{u.value}</SelectableCode>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </BaseTokenDisplay>
  );
};

export type SpecialDimensionsProps = Record<string, never>;

/**
 * Container component for special dimension tokens
 * Uses separated business logic and pure components
 */
export const SpecialDimensions: React.FC<SpecialDimensionsProps> = () => {
  const { specials } = useDimensionTokens();

  return (
    <BaseTokenDisplay>
      {() => {
        if (specials.length === 0) return null;

        return (
          <div className={styles.specialSection}>
            <h3 className={styles.specialTitle}>Special Dimensions</h3>
            <div className={styles.specialGrid}>
              {specials.map((dimension) => (
                <DimensionCard key={dimension.key} dimension={dimension} />
              ))}
            </div>
          </div>
        );
      }}
    </BaseTokenDisplay>
  );
};
