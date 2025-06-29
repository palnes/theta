import React from 'react';
import styles from '../../styles/DimensionScale.module.css';
import type { StringToken } from '../../types/tokens';
import { SelectableCode } from '../common/SelectableCode';

export interface DimensionCardProps {
  dimension: StringToken;
}

/**
 * Pure component for displaying a special dimension token
 */
export const DimensionCard: React.FC<DimensionCardProps> = ({ dimension }) => {
  const { tokenValue, usage } = dimension;

  return (
    <div className={styles.specialItem}>
      <span className={styles.specialValue}>{tokenValue}</span>
      {usage?.map((u) => (
        <React.Fragment key={u.label}>
          <span className={styles.specialSeparator}>•</span>
          <SelectableCode className={styles.specialCode}>{u.value}</SelectableCode>
        </React.Fragment>
      ))}
    </div>
  );
};
