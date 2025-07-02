import type React from 'react';
import { useTokens } from '../../hooks/useTokens';
import sharedStyles from '../../styles/shared.module.css';
import type { TokenInfo } from '../../types/tokenReferenceTable';
import { TokenCard } from '../common/TokenCard';

interface TokenListProps {
  tier?: string; // Made optional and string to support any tier
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
export const TokenList: React.FC<TokenListProps> = ({
  tier,
  category,
  renderPreview,
  renderAdditionalInfo,
  gridSize = 'medium',
  gridClassName,
  variant = 'card',
}) => {
  const { tokens, loading, error } = useTokens({ tier, category });

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

        return (
          <li key={token.path} style={{ listStyle: 'none' }}>
            <TokenCard
              title={key}
              usage={token.usage}
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
