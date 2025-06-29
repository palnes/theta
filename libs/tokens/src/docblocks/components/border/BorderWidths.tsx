import React from 'react';
import { useTokens } from '../../hooks/useTokens';
import sharedStyles from '../../styles/shared.module.css';
import { TokenCard } from '../common/TokenCard';

/**
 * Display border width tokens
 * More focused component that does one thing well
 */
export const BorderWidths: React.FC = () => {
  // Get border width tokens directly
  const {
    tokens: widthTokens,
    loading,
    error,
  } = useTokens({
    tier: 'sys',
    category: 'border',
    filter: (token) => token.path.includes('.width.'),
  });

  if (loading) return <div>Loading border widths...</div>;
  if (error) return <div>Error loading borders: {error}</div>;
  if (!widthTokens || widthTokens.length === 0) return <div>No border width tokens available</div>;

  return (
    <ul className={sharedStyles.gridMedium}>
      {widthTokens.map((token) => {
        const { name: key, description, value, usage } = token;

        return (
          <li key={token.path} style={{ listStyle: 'none' }}>
            <TokenCard
              title={key}
              usage={usage}
              preview={
                <div
                  className={sharedStyles.exampleBox}
                  style={{
                    borderWidth: value,
                    borderStyle: 'solid',
                    borderColor: 'var(--sys-color-border-strong)',
                  }}
                />
              }
            >
              {description && <p className={sharedStyles.description}>{description}</p>}
            </TokenCard>
          </li>
        );
      })}
    </ul>
  );
};
