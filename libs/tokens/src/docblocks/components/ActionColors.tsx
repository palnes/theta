import React from 'react';
import { useTokens } from '../hooks/useTokens';
import { ColorDisplay } from './ColorDisplay';

/**
 * Display action color tokens
 * Focused component for interactive element colors
 */
export const ActionColors: React.FC = () => {
  const { tokens, loading, error } = useTokens({
    tier: 'sys',
    category: 'color',
    filter: (token) => token.path.includes('.action.'),
  });

  if (loading) return <div>Loading action colors...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!tokens || tokens.length === 0) return <div>No action color tokens found</div>;

  return <ColorDisplay title="Action Colors" tokens={tokens} gridColumns="large" />;
};
