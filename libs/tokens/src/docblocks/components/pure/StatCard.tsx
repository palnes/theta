import React from 'react';
import styles from '../../styles/ThemeComparison.module.css';

export interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

/**
 * Pure component for displaying a statistic card
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subLabel,
  icon,
  variant = 'default',
}) => {
  const cardClass = `${styles.statCard} ${styles[`statCard--${variant}`] || ''}`;

  return (
    <div className={cardClass}>
      {icon && <div className={styles.statIcon}>{icon}</div>}
      <div className={styles.statContent}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
        {subLabel && <div className={styles.statSubLabel}>{subLabel}</div>}
      </div>
    </div>
  );
};
