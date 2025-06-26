import React from 'react';
import { TableControls } from './TableControls';
import { TokenRow } from './TokenRow';
import { useTableState } from '../hooks/useTableState';
import { useTokenData } from '../hooks/useTokenData';
import styles from '../styles/TokenReferenceTable.module.css';
import { TokenReferenceTableProps } from '../types/tokenReferenceTable';
import { getUsageLabel } from '../tools/tokenReferenceHelpers';

export const TokenReferenceTable: React.FC<TokenReferenceTableProps> = ({
  tier,
  category,
  filter,
}) => {
  const { tokens, loading, error } = useTokenData({ tier, category, filter });
  const {
    expandedRows,
    usageFormat,
    searchQuery,
    toggleRow,
    toggleAllRows,
    handleFormatChange,
    setSearchQuery,
  } = useTableState(tokens);

  if (loading) return <div>Loading token data...</div>;
  if (error) return <div>Error loading token data: {error}</div>;
  if (tokens.length === 0) return <div>No tokens found</div>;

  // Filter tokens based on search query
  const filteredTokens = searchQuery
    ? tokens.filter((token) => {
        const query = searchQuery.toLowerCase();
        return (
          token.name.toLowerCase().includes(query) ||
          token.path.toLowerCase().includes(query) ||
          token.cssVariable.toLowerCase().includes(query) ||
          token.value?.toString().toLowerCase().includes(query) ||
          token.description?.toLowerCase().includes(query)
        );
      })
    : tokens;

  return (
    <div className={styles.container}>
      <TableControls
        usageFormat={usageFormat}
        onFormatChange={handleFormatChange}
        expandedCount={expandedRows.size}
        totalCount={tokens.length}
        onToggleAll={toggleAllRows}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredCount={searchQuery ? filteredTokens.length : undefined}
      />
      {filteredTokens.length === 0 && searchQuery ? (
        <div className={styles.noResults}>No tokens found matching "{searchQuery}"</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCellToken}>Token</th>
              <th className={styles.headerCellValue}>Value</th>
              <th className={styles.headerCellUsage}>{getUsageLabel(usageFormat)}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.map((token) => (
              <TokenRow
                key={token.path}
                token={token}
                isExpanded={expandedRows.has(token.path)}
                onToggle={toggleRow}
                usageFormat={usageFormat}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
