import type React from 'react';
import styles from '../../styles/TableControls.module.css';
import type { UsageFormat } from '../../types/tokenReferenceTable';

interface TableControlsProps {
  usageFormat: UsageFormat;
  onFormatChange: (format: UsageFormat) => void;
  expandedCount: number;
  totalCount: number;
  onToggleAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount?: number;
}

export const TableControls: React.FC<TableControlsProps> = ({
  usageFormat,
  onFormatChange,
  expandedCount,
  totalCount,
  onToggleAll,
  searchQuery,
  onSearchChange,
  filteredCount,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Filter tokens..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && filteredCount !== undefined && (
          <span className={styles.searchResults}>
            {filteredCount} of {totalCount} tokens
          </span>
        )}
      </div>
      <div className={styles.controlsRow}>
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
    </div>
  );
};
