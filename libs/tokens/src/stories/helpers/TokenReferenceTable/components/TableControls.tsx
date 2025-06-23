import React from 'react';
import styles from '../styles/TableControls.module.css';
import { UsageFormat } from '../types';

interface TableControlsProps {
  usageFormat: UsageFormat;
  onFormatChange: (format: UsageFormat) => void;
  expandedCount: number;
  totalCount: number;
  onToggleAll: () => void;
}

export const TableControls: React.FC<TableControlsProps> = ({
  usageFormat,
  onFormatChange,
  expandedCount,
  totalCount,
  onToggleAll,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.formatSection}>
        <span className={styles.formatLabel}>Format:</span>
        <div className={styles.formatButtons}>
          {(['js', 'css', 'json'] as UsageFormat[]).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => onFormatChange(format)}
              className={`${styles.formatButton} ${usageFormat === format ? styles.formatButtonActive : ''}`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.expandToggle}>
        <button type="button" onClick={onToggleAll} className={styles.expandButton}>
          {expandedCount === totalCount ? 'Collapse All' : 'Expand All'}
        </button>
        <span className={styles.expandCount}>
          {expandedCount}/{totalCount}
        </span>
      </div>
    </div>
  );
};
