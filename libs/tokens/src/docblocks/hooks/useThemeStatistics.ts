import { useMemo } from 'react';

export interface ThemeStatistics {
  totalTokens: number;
  changedTokens: number;
  percentageChanged: number;
  categoryCounts: Record<string, { total: number; changed: number }>;
  changesByType: Record<string, number>;
}

/**
 * Hook to calculate theme statistics from documentation data
 */
export function useThemeStatistics(data: any, themeName: string): ThemeStatistics | null {
  return useMemo(() => {
    if (!data?.$themes?.[themeName]) return null;

    let totalTokens = 0;
    let changedTokens = 0;
    const categoryCounts: Record<string, { total: number; changed: number }> = {};
    const changesByType: Record<string, number> = {};

    // Process each tier
    ['ref', 'sys', 'cmp'].forEach((tier) => {
      if (!data[tier]) return;

      processTokenGroup(data[tier], tier, (path, baseToken) => {
        if (!baseToken || typeof baseToken !== 'object' || !baseToken.$value) return;

        totalTokens++;

        // Get theme override value
        const pathParts = path.split('.');
        const themeToken = getNestedValue(data.$themes[themeName][tier], pathParts.slice(1));

        // Track category
        const category = pathParts[1] || 'other';
        if (!categoryCounts[category]) {
          categoryCounts[category] = { total: 0, changed: 0 };
        }
        categoryCounts[category].total++;

        // Check if changed
        if (
          themeToken?.$value !== undefined &&
          JSON.stringify(themeToken.$value) !== JSON.stringify(baseToken.$value)
        ) {
          changedTokens++;
          categoryCounts[category].changed++;

          // Track by type
          const tokenType = baseToken.$type || 'unknown';
          changesByType[tokenType] = (changesByType[tokenType] || 0) + 1;
        }
      });
    });

    return {
      totalTokens,
      changedTokens,
      percentageChanged: totalTokens > 0 ? Math.round((changedTokens / totalTokens) * 100) : 0,
      categoryCounts,
      changesByType,
    };
  }, [data, themeName]);
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
