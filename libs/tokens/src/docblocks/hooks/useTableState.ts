import { useCallback, useState } from 'react';
import { TokenInfo, UsageFormat } from '../types/tokenReferenceTable';

export const useTableState = (tokens: TokenInfo[]) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [usageFormat, setUsageFormat] = useState<UsageFormat>(() => {
    // Load from localStorage or default to 'js'
    const saved = localStorage.getItem('tokenTableUsageFormat');
    return (saved as UsageFormat) || 'js';
  });

  const toggleRow = useCallback((tokenPath: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(tokenPath)) {
        newExpanded.delete(tokenPath);
      } else {
        newExpanded.add(tokenPath);
      }
      return newExpanded;
    });
  }, []);

  const toggleAllRows = useCallback(() => {
    setExpandedRows((prev) => {
      if (prev.size === tokens.length) {
        return new Set();
      }
      return new Set(tokens.map((t) => t.path));
    });
  }, [tokens]);

  const handleFormatChange = useCallback((format: UsageFormat) => {
    setUsageFormat(format);
    localStorage.setItem('tokenTableUsageFormat', format);
  }, []);

  return {
    expandedRows,
    usageFormat,
    searchQuery,
    toggleRow,
    toggleAllRows,
    handleFormatChange,
    setSearchQuery,
  };
};
