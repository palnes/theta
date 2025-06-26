import React, { useMemo } from 'react';
import styles from '../styles/ThemeDifferenceSummary.module.css';
import { useDocumentationData } from '../hooks/useDocumentationData';

interface DifferenceStats {
  category: string;
  total: number;
  changes: Record<string, number>;
  examples: Array<{
    token: string;
    from: string;
    to: string;
    change?: string;
  }>;
}

export const ThemeDifferenceSummary: React.FC = () => {
  const { data, loading, error } = useDocumentationData();

  const stats = useMemo(() => {
    if (!data) return [];

    const statsByCategory: Record<string, DifferenceStats> = {};

    // Analyze all tokens
    (['ref', 'sys', 'cmp'] as const).forEach((tier) => {
      const tierData = data[tier];
      if (tierData) {
        Object.entries(tierData).forEach(([, tokens]) => {
          tokens.forEach((token) => {
            if (token.isThemeable && token.themeValues) {
              // Extract category from path
              const pathParts = token.path.split('.');
              const cat =
                pathParts.length >= 3
                  ? `${pathParts[1]}.${pathParts[2]}`
                  : pathParts[1] || 'unknown';

              if (!statsByCategory[cat]) {
                statsByCategory[cat] = {
                  category: cat,
                  total: 0,
                  changes: {},
                  examples: [],
                };
              }

              const stats = statsByCategory[cat];
              stats.total++;

              // Count changes per theme
              token.overriddenIn?.forEach((theme: string) => {
                stats.changes[theme] = (stats.changes[theme] || 0) + 1;
              });

              // Add examples (limit to 3 per category)
              if (stats.examples.length < 3) {
                const baseValue = token.value;
                const darkValue = token.themeValues.dark || baseValue;

                let change: string | undefined;
                if (token.type === 'dimension' || token.type === 'fontSize') {
                  const base = Number.parseFloat(baseValue);
                  const dark = Number.parseFloat(darkValue);
                  if (!Number.isNaN(base) && !Number.isNaN(dark)) {
                    const diff = dark - base;
                    const percent = ((diff / base) * 100).toFixed(0);
                    change = diff > 0 ? `+${percent}%` : `${percent}%`;
                  }
                }

                stats.examples.push({
                  token: token.name,
                  from: String(baseValue).substring(0, 20),
                  to: String(darkValue).substring(0, 20),
                  change,
                });
              }
            }
          });
        });
      }
    });

    return Object.values(statsByCategory).sort((a, b) => b.total - a.total);
  }, [data]);

  if (loading) return <div>Loading summary...</div>;
  if (error) return <div>Error loading data: {error}</div>;
  if (!data) return null;

  const totalThemeable = stats.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <div className={styles.summary}>
      <div className={styles.header}>
        <h2>Theme Difference Summary</h2>
        <p className={styles.subtitle}>
          {totalThemeable} themeable tokens across {stats.length} categories
        </p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.category} className={styles.statCard}>
            <h3 className={styles.categoryTitle}>{stat.category}</h3>
            <div className={styles.statInfo}>
              <span className={styles.statCount}>{stat.total} tokens</span>
              {Object.entries(stat.changes).map(([theme, count]) => (
                <span key={theme} className={styles.themeCount}>
                  {count} in {theme}
                </span>
              ))}
            </div>

            {stat.examples.length > 0 && (
              <div className={styles.examples}>
                <h4 className={styles.examplesTitle}>Examples:</h4>
                {stat.examples.map((example) => (
                  <div key={`${stat.category}-${example.token}`} className={styles.example}>
                    <span className={styles.tokenName}>{example.token}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.toValue}>{example.to}</span>
                    {example.change && (
                      <span className={styles.changePercent}>{example.change}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <h3>Change Types:</h3>
        <ul>
          <li>
            <strong>Colors:</strong> Inverted for dark backgrounds
          </li>
          <li>
            <strong>Spacing:</strong> Increased by ~20-25% for better visual hierarchy
          </li>
          <li>
            <strong>Shadows:</strong> Reduced opacity for subtler effects
          </li>
          <li>
            <strong>Borders:</strong> Thinner widths, larger radii
          </li>
          <li>
            <strong>Typography:</strong> Increased line height and letter spacing
          </li>
          <li>
            <strong>Z-Index:</strong> Adjusted layering for dark mode components
          </li>
        </ul>
      </div>
    </div>
  );
};
