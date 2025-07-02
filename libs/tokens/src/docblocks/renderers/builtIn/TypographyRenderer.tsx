import type React from 'react';
import styles from '../../styles/Typography.module.css';
import type { TokenRendererDefinition, TokenRendererProps } from '../TokenRenderer';

/**
 * Renderer for typography tokens
 */
export const TypographyTokenRenderer: React.FC<TokenRendererProps> = ({
  token,
  className,
  showDetails,
}) => {
  const value = token.value;

  // Handle composite typography tokens
  if (typeof value === 'object' && value !== null) {
    const { fontSize, fontWeight, lineHeight, fontFamily } = value;

    return (
      <div className={className}>
        <div
          style={{
            fontSize: fontSize || '16px',
            fontWeight: fontWeight || 'normal',
            lineHeight: lineHeight || 1.5,
            fontFamily: fontFamily || 'inherit',
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
        {showDetails && (
          <div className={styles.tokenInfo}>
            <div className={styles.tokenName}>{token.name}</div>
            <div className={styles.tokenDetail}>
              {fontSize && <div>Size: {fontSize}</div>}
              {fontWeight && <div>Weight: {fontWeight}</div>}
              {lineHeight && <div>Line Height: {lineHeight}</div>}
              {fontFamily && <div>Family: {fontFamily}</div>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle individual typography properties
  let preview = null;
  const property = token.path?.split('.').pop();

  switch (property) {
    case 'fontSize':
      preview = <div style={{ fontSize: value }}>The quick brown fox</div>;
      break;
    case 'fontWeight':
      preview = <div style={{ fontWeight: value, fontSize: '16px' }}>The quick brown fox</div>;
      break;
    case 'lineHeight':
      preview = (
        <div style={{ lineHeight: value, fontSize: '14px' }}>
          Line one
          <br />
          Line two
          <br />
          Line three
        </div>
      );
      break;
    case 'fontFamily':
      preview = <div style={{ fontFamily: value }}>The quick brown fox</div>;
      break;
    default:
      preview = <div>{String(value)}</div>;
  }

  return (
    <div className={className}>
      {preview}
      {showDetails && (
        <div className={styles.tokenInfo}>
          <div className={styles.tokenName}>{token.name}</div>
          <div className={styles.tokenValue}>{String(value)}</div>
        </div>
      )}
    </div>
  );
};

/**
 * Typography renderer definition
 */
export const typographyRendererDefinition: TokenRendererDefinition = {
  id: 'typography',
  name: 'Typography Renderer',
  types: ['typography', 'fontSize', 'fontWeight', 'lineHeight', 'fontFamily'],
  test: (token) => {
    return (
      token.path?.includes('typography') ||
      token.path?.includes('fontSize') ||
      token.path?.includes('fontWeight') ||
      token.path?.includes('lineHeight') ||
      token.path?.includes('fontFamily') ||
      false
    );
  },
  component: TypographyTokenRenderer,
};
