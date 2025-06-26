import { useMemo, useState } from 'react';
import { TokenInfo } from '../types/tokenReferenceTable';
import type { TokenValue } from '../types/tokens';
import { useDocumentationData } from './useDocumentationData';

export interface ThemeComparisonToken extends TokenInfo {
  baseValue: TokenValue;
  themeValues: Record<string, TokenValue>;
  differences: Record<string, string | null>;
}

export interface UseThemeComparisonOptions {
  category?: string;
  showOnlyDifferent?: boolean;
}

export function useThemeComparisonData(options: UseThemeComparisonOptions = {}) {
  const { category = 'all', showOnlyDifferent = true } = options;
  const { data, loading, error } = useDocumentationData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);

  const themeableTokens = useMemo(() => {
    if (!data) return [];

    const tokens: ThemeComparisonToken[] = [];

    // Get themes from metadata
    const themes = data.metadata?.themes?.filter((t) => t !== 'base') || [];

    (['ref', 'sys', 'cmp'] as const).forEach((tier) => {
      const tierData = data[tier];
      if (tierData) {
        Object.entries(tierData).forEach(([, tokenList]) => {
          (tokenList as TokenInfo[]).forEach((token) => {
            if (showOnlyDifferent ? token.isThemeable : true) {
              const themeValues = token.themeValues || {};
              const differences: Record<string, string | null> = {};

              themes.forEach((theme) => {
                const themeValue = themeValues[theme];
                if (themeValue !== undefined) {
                  differences[theme] = calculateDifference(token.value, themeValue, token.type);
                }
              });

              tokens.push({
                ...token,
                baseValue: token.value,
                themeValues: themeValues as Record<string, TokenValue>,
                differences,
              });
            }
          });
        });
      }
    });

    return tokens;
  }, [data, showOnlyDifferent]);

  const filteredTokens = useMemo(() => {
    return themeableTokens.filter((token) => {
      const matchesSearch =
        searchTerm === '' ||
        token.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || token.path.startsWith(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [themeableTokens, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    themeableTokens.forEach((token) => {
      const parts = token.path.split('.');
      if (parts.length >= 2) {
        cats.add(`${parts[0]}.${parts[1]}`);
      }
    });
    return Array.from(cats).sort();
  }, [themeableTokens]);

  return {
    tokens: filteredTokens,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    themes: data?.metadata?.themes?.filter((t) => t !== 'base') || [],
  };
}

// Calculate the difference between two values
function calculateDifference(
  baseValue: TokenValue,
  themeValue: TokenValue,
  type?: string
): string | null {
  if (type === 'dimension' || type === 'fontSize') {
    const base = Number.parseFloat(String(baseValue));
    const theme = Number.parseFloat(String(themeValue));
    if (!Number.isNaN(base) && !Number.isNaN(theme)) {
      const diff = theme - base;
      const percent = ((diff / base) * 100).toFixed(0);
      return diff > 0 ? `+${diff}px (+${percent}%)` : `${diff}px (${percent}%)`;
    }
  } else if (type === 'number') {
    const base = Number.parseFloat(String(baseValue));
    const theme = Number.parseFloat(String(themeValue));
    if (!Number.isNaN(base) && !Number.isNaN(theme)) {
      const diff = theme - base;
      return diff > 0 ? `+${diff}` : `${diff}`;
    }
  }
  return null;
}
