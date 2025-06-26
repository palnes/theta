import { useMemo } from 'react';

export interface TokenDifference {
  path: string;
  baseValue: any;
  themeValues: Record<string, any>;
  type: string;
  hasChanges: boolean;
}

export interface ThemeComparisonData {
  differences: TokenDifference[];
  categories: string[];
  selectedCategory: string;
}

/**
 * Hook to process theme comparison data
 */
export function useThemeComparison(data: any, selectedCategory = 'all'): ThemeComparisonData {
  const differences = useMemo(() => {
    if (!data) return [];

    const baseTheme = 'base';
    const themes = Object.keys(data.$themes || {}).filter((t) => t !== baseTheme);
    const allDifferences: TokenDifference[] = [];

    // Process each tier
    ['ref', 'sys', 'cmp'].forEach((tier) => {
      if (!data[tier]) return;

      processTokenGroup(data[tier], tier, (path, token) => {
        if (!token || typeof token !== 'object' || !token.$value) return;

        const themeValues: Record<string, any> = {};
        let hasChanges = false;

        themes.forEach((theme) => {
          const pathParts = path.split('.').slice(1);
          const themeToken = getNestedValue(data.$themes?.[theme]?.[tier], pathParts);
          const themeValue = themeToken?.$value;
          if (themeValue !== undefined) {
            themeValues[theme] = themeValue;
            if (JSON.stringify(themeValue) !== JSON.stringify(token.$value)) {
              hasChanges = true;
            }
          }
        });

        allDifferences.push({
          path,
          baseValue: token.$value,
          themeValues,
          type: token.$type || 'unknown',
          hasChanges,
        });
      });
    });

    return allDifferences;
  }, [data]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['all']);
    differences.forEach((diff) => {
      const parts = diff.path.split('.');
      if (parts.length >= 2 && parts[1]) {
        cats.add(parts[1]);
      }
    });
    return Array.from(cats);
  }, [differences]);

  const filteredDifferences = useMemo(() => {
    if (selectedCategory === 'all') return differences;
    return differences
      .filter((diff) => {
        const parts = diff.path.split('.');
        return parts.length >= 2 && parts[1] === selectedCategory;
      })
      .filter((diff) => diff.path !== undefined);
  }, [differences, selectedCategory]);

  return {
    differences: filteredDifferences,
    categories,
    selectedCategory,
  };
}

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => current?.[key], obj);
}

// Helper function to recursively process token groups
function processTokenGroup(obj: any, path: string, callback: (path: string, token: any) => void) {
  Object.entries(obj).forEach(([key, value]) => {
    const newPath = path ? `${path}.${key}` : key;

    if (value && typeof value === 'object') {
      if (value && '$value' in value) {
        callback(newPath, value);
      } else {
        processTokenGroup(value, newPath, callback);
      }
    }
  });
}
