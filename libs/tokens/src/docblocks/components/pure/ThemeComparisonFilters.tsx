import React from 'react';
import styles from '../../styles/ThemeComparison.module.css';

export interface ThemeComparisonFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  tokenCount: number;
}

/**
 * Pure component for theme comparison filters
 */
export const ThemeComparisonFilters: React.FC<ThemeComparisonFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  tokenCount,
}) => {
  return (
    <div className={styles.filters}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.tokenCount}>
          {tokenCount} {tokenCount === 1 ? 'token' : 'tokens'}
        </span>
      </div>

      <div className={styles.categoryFilter}>
        <label htmlFor="category-select" className={styles.filterLabel}>
          Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={styles.categorySelect}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
