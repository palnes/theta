import React from 'react';
import { useSemanticColorTokens } from '../hooks/useColorTokens';
import { ColorDisplay } from './ColorDisplay';
import { TextColorDisplay } from './TextColorDisplay';

export const SemanticColorDisplay: React.FC = () => {
  const { categories, loading, error } = useSemanticColorTokens();

  if (loading) return <div>Loading semantic colors...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!categories) return null;

  return (
    <>
      {Object.entries(categories).map(([categoryName, { label, tokens }]) => {
        if (tokens.length === 0) return null;

        // Use special component for text colors
        if (categoryName === 'text') {
          return (
            <div key={categoryName} style={{ marginBottom: 'var(--sys-spacing-xl)' }}>
              <h2>{label}</h2>
              <TextColorDisplay tokens={tokens} />
            </div>
          );
        }

        return (
          <div key={categoryName} style={{ marginBottom: 'var(--sys-spacing-xl)' }}>
            <ColorDisplay
              title={label}
              tokens={tokens}
              gridColumns="large"
              groupBy={categoryName === 'status' || categoryName === 'state' ? 'category' : 'none'}
            />
          </div>
        );
      })}
    </>
  );
};
