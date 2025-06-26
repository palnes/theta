import React from 'react';
import { useTokens } from '../hooks/useTokens';
import { ColorDisplay } from './ColorDisplay';

/**
 * Display status color tokens
 * For success, warning, error, and info states
 */
export const StatusColors: React.FC = () => {
  const { tokens, loading, error } = useTokens({
    tier: 'sys',
    category: 'color',
    filter: (token) => token.path.includes('.status.'),
  });

  if (loading) return <div>Loading status colors...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!tokens || tokens.length === 0) return <div>No status color tokens found</div>;

  return (
    <ColorDisplay title="Status Colors" tokens={tokens} gridColumns="large" groupBy="category" />
  );
};
