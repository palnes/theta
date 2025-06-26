import React from 'react';
import { useTokenData } from '../hooks/useTokenData';
import sharedStyles from '../styles/shared.module.css';
import type { TokenInfo } from '../types/tokenReferenceTable';
import { createTokenFormats } from '../tools/tokenUtils';
import { TokenCard } from './TokenCard';

interface GenericTokenDisplayProps {
  tier: 'ref' | 'sys' | 'cmp';
  category: string;
  renderPreview?: (token: TokenInfo) => React.ReactNode;
  renderAdditionalInfo?: (token: TokenInfo) => React.ReactNode;
  gridSize?: 'small' | 'medium' | 'large';
  gridClassName?: string;
  variant?: 'card' | 'minimal';
}

/**
 * Generic component for displaying any token type
 * Replaces multiple similar display components
 */
export const GenericTokenDisplay: React.FC<GenericTokenDisplayProps> = ({
  tier,
  category,
  renderPreview,
  renderAdditionalInfo,
  gridSize = 'medium',
  gridClassName,
  variant = 'card',
}) => {
  const { tokens, loading, error } = useTokenData({ tier, category });

  if (loading) return <div>Loading {category} tokens...</div>;
  if (error)
    return (
      <div>
        Error loading {category}: {error}
      </div>
    );
  if (!tokens || tokens.length === 0) return null;

  const gridClass =
    gridClassName ||
    {
      small: sharedStyles.tokenGridSmall,
      medium: sharedStyles.tokenGrid,
      large: sharedStyles.tokenGridLarge,
    }[gridSize];

  // Tokens are already in the correct format from useTokenData

  return (
    <ul className={gridClass}>
      {tokens.map((token: TokenInfo) => {
        const key = token.name;
        const value = token.value;
        const { cssVariable, jsPath, jsFlat } = token;

        const formats = createTokenFormats(cssVariable, jsPath, key, category, jsFlat);

        return (
          <li key={token.path} style={{ listStyle: 'none' }}>
            <TokenCard
              title={key}
              formats={formats}
              preview={renderPreview?.(token)}
              variant={variant}
            >
              {renderAdditionalInfo ? (
                renderAdditionalInfo(token)
              ) : (
                <p>
                  <span className={sharedStyles.formatLabel}>Value:</span> {value?.toString()}
                </p>
              )}
            </TokenCard>
          </li>
        );
      })}
    </ul>
  );
};

// For simple token displays, we'll create them where they're used
// This reduces the number of exports and keeps related code together
