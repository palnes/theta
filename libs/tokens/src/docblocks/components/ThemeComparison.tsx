import React from 'react';
import { useThemeComparisonData } from '../hooks/useThemeComparisonData';
import styles from '../styles/ThemeComparison.module.css';
import { ErrorState } from './pure/ErrorState';
import { LoadingState } from './pure/LoadingState';
import { ThemeComparisonFilters } from './pure/ThemeComparisonFilters';
import { ThemeComparisonTable } from './pure/ThemeComparisonTable';

interface ThemeComparisonProps {
  category?: string;
  showOnlyDifferent?: boolean;
}

/**
 * Container component for theme comparison
 * Uses separated business logic and pure presentation components
 */
export const ThemeComparison: React.FC<ThemeComparisonProps> = ({
  category,
  showOnlyDifferent = true,
}) => {
  const {
    tokens,
    themes,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
  } = useThemeComparisonData({ category, showOnlyDifferent });

  if (loading) {
    return <LoadingState message="Loading theme comparison data..." />;
  }

  if (error) {
    return <ErrorState error={error} title="Error loading theme comparison" />;
  }

  if (!tokens || themes.length === 0) {
    return <div className={styles.emptyState}>No themes available for comparison.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Theme Token Comparison</h2>
        {showOnlyDifferent && (
          <p className={styles.subtitle}>Showing only tokens that differ between themes</p>
        )}
      </div>

      <ThemeComparisonFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        tokenCount={tokens.length}
      />

      <ThemeComparisonTable tokens={tokens} themes={themes} />
    </div>
  );
};
