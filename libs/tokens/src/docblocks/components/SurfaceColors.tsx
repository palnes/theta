import React from 'react';
import { useTokens } from '../hooks/useTokens';
import { ColorDisplay } from './ColorDisplay';

/**
 * Display surface color tokens
 * For backgrounds and container colors
 */
export const SurfaceColors: React.FC = () => {
  const { tokens, loading, error } = useTokens({
    tier: 'sys',
    category: 'color',
    filter: (token) => token.path.includes('.surface.'),
  });

  if (loading) return <div>Loading surface colors...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!tokens || tokens.length === 0) return <div>No surface color tokens found</div>;

  return <ColorDisplay title="Surface Colors" tokens={tokens} gridColumns="large" />;
};
