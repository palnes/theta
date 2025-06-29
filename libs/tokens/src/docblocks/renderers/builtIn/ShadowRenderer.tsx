import React from 'react';
import styles from '../../styles/shared.module.css';
import { TokenRendererDefinition, TokenRendererProps } from '../TokenRenderer';

/**
 * Renderer for shadow tokens
 */
export const ShadowTokenRenderer: React.FC<TokenRendererProps> = ({
  token,
  className,
  showDetails,
}) => {
  const shadowValue = token.value;

  return (
    <div className={className}>
      <div
        style={{
          width: showDetails ? '200px' : '100px',
          height: showDetails ? '100px' : '60px',
          backgroundColor: 'var(--sys-color-surface-primary)',
          boxShadow: shadowValue,
          borderRadius: 'var(--sys-radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={'Shadow preview'}
      >
        <span style={{ fontSize: '12px', color: 'var(--sys-color-text-secondary)' }}>Shadow</span>
      </div>
      {showDetails && (
        <div className={styles.tokenInfo}>
          <div className={styles.tokenName}>{token.name}</div>
          <div className={styles.tokenValue} style={{ fontSize: '11px' }}>
            {shadowValue}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Shadow renderer definition
 */
export const shadowRendererDefinition: TokenRendererDefinition = {
  id: 'shadow',
  name: 'Shadow Renderer',
  types: ['shadow', 'boxShadow'],
  test: (token) => {
    return token.path?.includes('shadow') || false;
  },
  component: ShadowTokenRenderer,
};
