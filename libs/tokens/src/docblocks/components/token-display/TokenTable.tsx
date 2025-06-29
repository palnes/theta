import React from 'react';
import { useTokenSystemConfig } from '../../contexts/TokenSystemContext';
import { useTableState } from '../../hooks/useTableState';
import { useTokens } from '../../hooks/useTokens';
import styles from '../../styles/TokenTable.module.css';
import { DEFAULT_TOKEN_CONFIG } from '../../types/TokenSystemConfig';
import { TokenTableProps } from '../../types/tokenReferenceTable';
import { TableControls } from '../common/TableControls';
import { TokenRow } from './TokenRow';

/**
 * Token table component that works with any token system
 */
export const TokenTable: React.FC<TokenTableProps> = ({ tier, category, filter, tokenData }) => {
  // Try to get config from context, fall back to default if tokenData is provided directly
  let config: typeof DEFAULT_TOKEN_CONFIG;
  try {
    config = useTokenSystemConfig();
  } catch (error) {
    // If not in context and tokenData is provided, use default config
    if (tokenData) {
      config = DEFAULT_TOKEN_CONFIG;
    } else {
      throw error;
    }
  }

  const { tokens, loading, error } = useTokens({ tier, category, filter, tokenData });
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
        const formatConfig = config.formats?.formats || [];

        // Search in all configured formats
        const formatMatches = formatConfig.some((format) => {
          const value = format.getValue(token);
          return value.toLowerCase().includes(query);
        });

        return (
          token.name.toLowerCase().includes(query) ||
          token.path.toLowerCase().includes(query) ||
          formatMatches ||
          token.value?.toString().toLowerCase().includes(query) ||
          token.description?.toLowerCase().includes(query)
        );
      })
    : tokens;

  // Get the display format label
  const getFormatLabel = () => {
    const format = config.formats?.formats.find((f) => f.id === usageFormat);
    return format?.label || usageFormat.toUpperCase();
  };

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
      />

      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.headerCellToken}>Token</th>
            <th className={styles.headerCellValue}>Value</th>
            <th className={styles.headerCellUsage}>{getFormatLabel()}</th>
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

      <div className={styles.summary}>
        Showing {filteredTokens.length} of {tokens.length} tokens
        {tier && tier !== 'all' && (
          <span> from {config.tiers.find((t) => t.id === tier)?.name || tier} tier</span>
        )}
        {category && (
          <span>
            {' '}
            in {config.categories.find((c) => c.id === category)?.name || category} category
          </span>
        )}
      </div>
    </div>
  );
};
