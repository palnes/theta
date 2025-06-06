import React from 'react';
import { TableControls } from './components/TableControls';
import { TokenRow } from './components/TokenRow';
import { useTableState } from './hooks/useTableState';
import { useTokenData } from './hooks/useTokenData';
import { TokenReferenceTableProps } from './types';
import { getUsageLabel } from './utils/tokenHelpers';

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
    <div style={{ marginBottom: 48 }}>
      <TableControls
        usageFormat={usageFormat}
        onFormatChange={handleFormatChange}
        expandedCount={expandedRows.size}
        totalCount={tokens.length}
        onToggleAll={toggleAllRows}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', width: '40%' }}>Token</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', width: '35%' }}>Value</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', width: '25%' }}>
              {getUsageLabel(usageFormat)}
            </th>
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
