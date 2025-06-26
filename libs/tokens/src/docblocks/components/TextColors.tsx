import React from 'react';
import { useTokens } from '../hooks/useTokens';
import { TextColorDisplay } from './TextColorDisplay';

/**
 * Display text color tokens
 * Self-contained component that fetches its own data
 */
export const TextColors: React.FC = () => {
  const { tokens, loading, error } = useTokens({
    tier: 'sys',
    category: 'color',
    filter: (token) => token.path.includes('.text.'),
  });

  if (loading) return <div>Loading text colors...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!tokens || tokens.length === 0) return <div>No text color tokens found</div>;

  return <TextColorDisplay tokens={tokens} />;
};
