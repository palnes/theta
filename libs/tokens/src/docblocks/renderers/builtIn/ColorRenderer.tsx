import React from 'react';
import styles from '../../styles/shared.module.css';
import { TokenRendererDefinition, TokenRendererProps } from '../TokenRenderer';

/**
 * Renderer for color tokens
 */
export const ColorTokenRenderer: React.FC<TokenRendererProps> = ({
  token,
  className,
  showDetails,
}) => {
  const colorValue = token.value;

  return (
    <div className={className}>
      <div
        className={styles.visualExample}
        style={{
          backgroundColor: colorValue,
          width: showDetails ? '100%' : '48px',
          height: showDetails ? '80px' : '48px',
          borderRadius: 'var(--sys-radius-sm)',
          border: '1px solid var(--sys-color-border-subtle)',
        }}
        aria-label={`Color preview: ${colorValue}`}
      />
      {showDetails && (
        <div className={styles.tokenInfo}>
          <div className={styles.tokenName}>{token.name}</div>
          <div className={styles.tokenValue}>{colorValue}</div>
        </div>
      )}
    </div>
  );
};

/**
 * Color renderer definition
 */
export const colorRendererDefinition: TokenRendererDefinition = {
  id: 'color',
  name: 'Color Renderer',
  types: ['color'],
  test: (token) => {
    // Additional test for color-like values
    const value = token.value;
    if (typeof value !== 'string') return false;

    // Check for hex colors, rgb, rgba, hsl, hsla
    return (
      /^#[0-9A-F]{3,8}$/i.test(value) ||
      /^rgb/.test(value) ||
      /^hsl/.test(value) ||
      /^var\(--/.test(value)
    );
  },
  component: ColorTokenRenderer,
};
