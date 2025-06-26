import React from 'react';
import styles from '../../styles/DimensionScale.module.css';
import type { StringToken } from '../../types/tokens';
import { SelectableCode } from '../SelectableCode';

export interface SpecialDimensionCardProps {
  dimension: StringToken;
}

/**
 * Pure component for displaying a special dimension token
 */
export const SpecialDimensionCard: React.FC<SpecialDimensionCardProps> = ({ dimension }) => {
  const { tokenValue, cssVariable, jsPath, jsFlat } = dimension;

  return (
    <div className={styles.specialItem}>
      <span className={styles.specialValue}>{tokenValue}</span>
      <span className={styles.specialSeparator}>•</span>
      <SelectableCode className={styles.specialCode}>{jsFlat || jsPath}</SelectableCode>
      <span className={styles.specialSeparator}>•</span>
      <SelectableCode className={styles.specialCode}>{cssVariable}</SelectableCode>
      <span className={styles.specialSeparator}>•</span>
      <SelectableCode className={styles.specialCode}>{jsPath}</SelectableCode>
    </div>
  );
};
