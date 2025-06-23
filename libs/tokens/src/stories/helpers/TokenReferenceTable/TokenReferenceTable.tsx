import React from 'react';
import { TableControls } from './components/TableControls';
import { TokenRow } from './components/TokenRow';
import { useTableState } from './hooks/useTableState';
import { useTokenData } from './hooks/useTokenData';
import styles from './styles/TokenReferenceTable.module.css';
import { TokenReferenceTableProps } from './types';
import { getUsageLabel } from './utils/tokenReferenceHelpers';

export const TokenReferenceTable: React.FC<TokenReferenceTableProps> = ({
  tier,
  category,
  filter,
}) => {
  const { tokens, loading, error } = useTokenData({ tier, category, filter });
  const { expandedRows, usageFormat, toggleRow, toggleAllRows, handleFormatChange } =
    useTableState(tokens);

  if (loading) return <div>Loading token data...</div>;
  if (error) return <div>Error loading token data: {error}</div>;
  if (tokens.length === 0) return <div>No tokens found</div>;

  return (
    <div className={styles.container}>
      <TableControls
        usageFormat={usageFormat}
        onFormatChange={handleFormatChange}
        expandedCount={expandedRows.size}
        totalCount={tokens.length}
        onToggleAll={toggleAllRows}
      />
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.headerCellToken}>Token</th>
            <th className={styles.headerCellValue}>Value</th>
            <th className={styles.headerCellUsage}>{getUsageLabel(usageFormat)}</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
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
    </div>
  );
};
