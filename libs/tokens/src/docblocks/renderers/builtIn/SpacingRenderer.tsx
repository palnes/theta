import React from 'react';
import styles from '../../styles/shared.module.css';
import { TokenRendererDefinition, TokenRendererProps } from '../TokenRenderer';

/**
 * Renderer for spacing tokens
 */
export const SpacingTokenRenderer: React.FC<TokenRendererProps> = ({
  token,
  className,
  showDetails,
}) => {
  const spacingValue = typeof token.value === 'number' ? `${token.value}px` : token.value;
  const numericValue = typeof token.value === 'number' ? token.value : Number.parseInt(token.value);

  return (
    <div className={className}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: `${Math.min(numericValue, 200)}px`,
            height: '24px',
            backgroundColor: 'var(--sys-color-action-primary-default)',
            borderRadius: 'var(--sys-radius-xs)',
          }}
          aria-label={`Spacing preview: ${spacingValue}`}
        />
        <span className={styles.tokenValue}>{spacingValue}</span>
      </div>
      {showDetails && (
        <div className={styles.tokenInfo}>
          <div className={styles.tokenName}>{token.name}</div>
          <div className={styles.description}>{token.description}</div>
        </div>
      )}
    </div>
  );
};

/**
 * Spacing renderer definition
 */
export const spacingRendererDefinition: TokenRendererDefinition = {
  id: 'spacing',
  name: 'Spacing Renderer',
  types: ['spacing', 'dimension'],
  test: (token) => {
    // Check if token path contains spacing
    return token.path?.includes('spacing') || false;
  },
  component: SpacingTokenRenderer,
};
