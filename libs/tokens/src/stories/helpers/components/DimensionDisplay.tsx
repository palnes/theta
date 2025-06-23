import React from 'react';
import { DIMENSION_SCALE } from '../constants/displayConstants';
import styles from '../styles/DimensionScale.module.css';
import { extractDimensions, extractSpecialDimensions } from '../tokenHelpers';
import { BaseTokenDisplay } from './BaseTokenDisplay';
import { SelectableCode } from './SelectableCode';

export type DimensionDisplayProps = Record<string, never>;

export const DimensionDisplay: React.FC<DimensionDisplayProps> = () => {
  return (
    <BaseTokenDisplay loadingKey="dimensions" errorKey="dimensions">
      {(data) => {
        const dimensions = extractDimensions(data.ref?.dimension || []);

        // Find the maximum negative value (most negative) and maximum positive value
        const negativeValues = dimensions.filter((d) => d.value < 0);
        const positiveValues = dimensions.filter((d) => d.value >= 0);
        const maxNegative =
          negativeValues.length > 0 ? Math.abs(Math.min(...negativeValues.map((d) => d.value))) : 0;
        const maxPositive =
          positiveValues.length > 0
            ? Math.max(...positiveValues.map((d) => d.value), DIMENSION_SCALE.defaultMax)
            : DIMENSION_SCALE.defaultMax;

        return (
          <div className={styles.dimensionScale}>
            {dimensions.map(({ value, tokenValue, key, cssVariable, jsPath, jsFlat }) => (
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
                  <span className={styles.dimensionSeparator}>•</span>
                  <SelectableCode className={styles.dimensionCode}>
                    {jsFlat || jsPath}
                  </SelectableCode>
                  <span className={styles.dimensionSeparator}>•</span>
                  <SelectableCode className={styles.dimensionCode}>{cssVariable}</SelectableCode>
                  <span className={styles.dimensionSeparator}>•</span>
                  <SelectableCode className={styles.dimensionCode}>{jsPath}</SelectableCode>
                </div>
              </div>
            ))}
          </div>
        );
      }}
    </BaseTokenDisplay>
  );
};

export type SpecialDimensionsDisplayProps = Record<string, never>;

export const SpecialDimensionsDisplay: React.FC<SpecialDimensionsDisplayProps> = () => {
  return (
    <BaseTokenDisplay>
      {(data) => {
        const specials = extractSpecialDimensions(data.ref?.dimension || []);

        if (specials.length === 0) return null;

        return (
          <div className={styles.specialSection}>
            <h3 className={styles.specialTitle}>Special Dimensions</h3>
            <div className={styles.specialGrid}>
              {specials.map(({ key, tokenValue, cssVariable, jsPath, jsFlat }) => {
                return (
                  <div key={key} className={styles.specialItem}>
                    <span className={styles.specialValue}>{tokenValue}</span>
                    <span className={styles.specialSeparator}>•</span>
                    <SelectableCode className={styles.specialCode}>
                      {jsFlat || jsPath}
                    </SelectableCode>
                    <span className={styles.specialSeparator}>•</span>
                    <SelectableCode className={styles.specialCode}>{cssVariable}</SelectableCode>
                    <span className={styles.specialSeparator}>•</span>
                    <SelectableCode className={styles.specialCode}>{jsPath}</SelectableCode>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
    </BaseTokenDisplay>
  );
};
