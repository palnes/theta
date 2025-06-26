import React from 'react';
import { useTokens } from '../hooks/useTokens';
import { ColorDisplay } from './ColorDisplay';

/**
 * Display border color tokens
 * For all border color variations
 */
export const BorderColors: React.FC = () => {
  const { tokens, loading, error } = useTokens({
    tier: 'sys',
    category: 'color',
    filter: (token) => token.path.includes('.border.'),
  });

  if (loading) return <div>Loading border colors...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!tokens || tokens.length === 0) return <div>No border color tokens found</div>;

  return <ColorDisplay title="Border Colors" tokens={tokens} gridColumns="large" />;
};
